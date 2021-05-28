import chai, { expect } from 'chai'
import { BigNumber, Contract, constants, utils } from 'ethers'
import { solidity, MockProvider, createFixtureLoader, deployContract } from 'ethereum-waffle'
import { ecsign } from 'ethereumjs-util'

import { governanceFixture } from './fixtures'
import { expandTo18Decimals, mineBlock } from './utils'

import Lion from '../build/Lion.json'

chai.use(solidity)

const DOMAIN_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('EIP712Domain(string name,uint256 chainId,address verifyingContract)')
)

const PERMIT_TYPEHASH = utils.keccak256(
  utils.toUtf8Bytes('Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)')
)

describe('Lion', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      hardfork: 'istanbul',
      mnemonic: 'horn horn horn horn horn horn horn horn horn horn horn horn',
      gasLimit: 9999999,
    },
  })
  const [wallet, other0, other1] = provider.getWallets()
  const loadFixture = createFixtureLoader([wallet], provider)

  let lion: Contract
  beforeEach(async () => {
    const fixture = await loadFixture(governanceFixture)
    lion = fixture.lion
  })

  it('permit', async () => {
    const domainSeparator = utils.keccak256(
      utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'uint256', 'address'],
        [DOMAIN_TYPEHASH, utils.keccak256(utils.toUtf8Bytes('Cheapswap')), 1, lion.address]
      )
    )

    const owner = wallet.address
    const spender = other0.address
    const value = 123
    const nonce = await lion.nonces(wallet.address)
    const deadline = constants.MaxUint256
    const digest = utils.keccak256(
      utils.solidityPack(
        ['bytes1', 'bytes1', 'bytes32', 'bytes32'],
        [
          '0x19',
          '0x01',
          domainSeparator,
          utils.keccak256(
            utils.defaultAbiCoder.encode(
              ['bytes32', 'address', 'address', 'uint256', 'uint256', 'uint256'],
              [PERMIT_TYPEHASH, owner, spender, value, nonce, deadline]
            )
          ),
        ]
      )
    )

    const { v, r, s } = ecsign(Buffer.from(digest.slice(2), 'hex'), Buffer.from(wallet.privateKey.slice(2), 'hex'))

    await lion.permit(owner, spender, value, deadline, v, utils.hexlify(r), utils.hexlify(s))
    expect(await lion.allowance(owner, spender)).to.eq(value)
    expect(await lion.nonces(owner)).to.eq(1)

    await lion.connect(other0).transferFrom(owner, spender, value)
  })

  it('nested delegation', async () => {
    await lion.transfer(other0.address, expandTo18Decimals(1))
    await lion.transfer(other1.address, expandTo18Decimals(2))

    let currectVotes0 = await lion.getCurrentVotes(other0.address)
    let currectVotes1 = await lion.getCurrentVotes(other1.address)
    expect(currectVotes0).to.be.eq(0)
    expect(currectVotes1).to.be.eq(0)

    await lion.connect(other0).delegate(other1.address)
    currectVotes1 = await lion.getCurrentVotes(other1.address)
    expect(currectVotes1).to.be.eq(expandTo18Decimals(1))

    await lion.connect(other1).delegate(other1.address)
    currectVotes1 = await lion.getCurrentVotes(other1.address)
    expect(currectVotes1).to.be.eq(expandTo18Decimals(1).add(expandTo18Decimals(2)))

    await lion.connect(other1).delegate(wallet.address)
    currectVotes1 = await lion.getCurrentVotes(other1.address)
    expect(currectVotes1).to.be.eq(expandTo18Decimals(1))
  })

  it('mints', async () => {
    const { timestamp: now } = await provider.getBlock('latest')
    const lion = await deployContract(wallet, Lion, [wallet.address, wallet.address, now + 60 * 60])
    const supply = await lion.totalSupply()

    await expect(lion.mint(wallet.address, 1)).to.be.revertedWith('Lion::mint: minting not allowed yet')

    let timestamp = await lion.mintingAllowedAfter()
    await mineBlock(provider, timestamp.toString())

    await expect(lion.connect(other1).mint(other1.address, 1)).to.be.revertedWith('Lion::mint: only the minter can mint')
    await expect(lion.mint('0x0000000000000000000000000000000000000000', 1)).to.be.revertedWith('Lion::mint: cannot transfer to the zero address')

    // can mint up to 2%
    const mintCap = BigNumber.from(await lion.mintCap())
    const amount = supply.mul(mintCap).div(100)
    await lion.mint(wallet.address, amount)
    expect(await lion.balanceOf(wallet.address)).to.be.eq(supply.add(amount))

    timestamp = await lion.mintingAllowedAfter()
    await mineBlock(provider, timestamp.toString())
    // cannot mint 2.01%
    await expect(lion.mint(wallet.address, supply.mul(mintCap.add(1)))).to.be.revertedWith('Lion::mint: exceeded mint cap')
  })
})
