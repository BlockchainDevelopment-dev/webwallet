import { observable, action, runInAction } from 'mobx'

import { MAINNET } from '../services/chain'
import { getCheckCrowdsaleTokensEntitlement, postRedeemCrowdsaleTokens } from '../services/api-service'

const LS_ALREADY_REDEEMED_TOKENS = 'alreadyRedeemedTokens'

class RedeemTokensStore {
  @observable pubkeyBase64 = ''
  @observable pubkeyBase58 = ''
  @observable walletPublicAddress = ''
  @observable status
  @observable amountRedeemable
  @observable alreadyRedeemed = false
  @observable anyOrders = false
  @observable inProgress = false
  @observable checkingTokenEntitlement = false
  @observable redeemingTokens = false
  @observable pubkey = false
  @observable pubkeyIsValid = false

  constructor(networkStore) {
    this.networkStore = networkStore
  }
  @action
  async checkCrowdsaleTokensEntitlement() {
    this.inProgress = true
    this.checkingTokenEntitlement = true

    try {
      const response =
        await getCheckCrowdsaleTokensEntitlement(this.pubkeyBase64, this.pubkeyBase58)
      runInAction(() => {
        console.log('getCheckCrowdsaleTokensEntitlement response', response)
        this.anyOrders = response.any_orders
        this.alreadyRedeemed = response.already_redeemed
        this.amountRedeemable = response.amount_redeemable
        this.inProgress = false
        this.checkingTokenEntitlement = false
      })
    } catch (error) {
      this.checkingTokenEntitlement = false
      this.inProgress = false
      runInAction(() => {
        console.log('getCheckCrowdsaleTokensEntitlement error', error)
      })
    }
  }


  @action
  async redeemCrowdsaleTokens() {
    this.inProgress = true
    this.redeemingTokens = true

    this.anyOrders = false
    this.alreadyRedeemed = false

    try {
      const response = await postRedeemCrowdsaleTokens({
        pubkey_base_64: this.pubkeyBase64,
        pubkey_base_58: this.pubkeyBase58,
        wallet_public_address: this.walletPublicAddress,
      })
      runInAction(() => {
        this.inProgress = false
        this.redeemingTokens = false
        if (response.status === 'success') {
          console.log('postRedeemCrowdsaleTokens response.status', response.status)
          localStorage.setItem(LS_ALREADY_REDEEMED_TOKENS, true)
          this.resetForm()
          this.status = response.status
          this.amountRedeemable = response.tokens_sent
          setTimeout(() => {
            this.status = ''
          }, 15000)
        } else {
          console.log('postRedeemCrowdsaleTokens error')
        }
        console.log('postRedeemCrowdsaleTokens response', response)
      })
    } catch (error) {
      runInAction(() => {
        this.inProgress = false
        this.redeemingTokens = false
        console.log('postRedeemCrowdsaleTokens error', error)
      })
    }
  }

  @action
  resetForm() {
    this.pubkeyBase64 = ''
    this.pubkeyBase58 = ''
    this.status = ''
    this.amountRedeemable = ''
    this.alreadyRedeemed = false
    this.anyOrders = false
    this.inProgress = false
    this.checkingTokenEntitlement = false
    this.redeemingTokens = false
    this.pubkey = false
    this.pubkeyIsValid = false
  }

  get shouldRedeemNonMainnetTokens() {
    const alreadyRedeemedTokens = localStorage.getItem(LS_ALREADY_REDEEMED_TOKENS)
    return this.isFaucetActive && !alreadyRedeemedTokens
  }
  get isFaucetActive() {
    return this.networkStore.chain !== MAINNET
  }
}

export default RedeemTokensStore
