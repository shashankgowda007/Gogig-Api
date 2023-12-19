export interface WalletCreds {
    userId: string,
    upiId: string,
    panCardNumber: string,
    panCardName: string
}

export interface WalletCredsUpdate {
    upiId?: string,
    panCardNumber?: string,
    panCardName?: string
}