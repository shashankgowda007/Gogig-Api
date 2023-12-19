export interface Acceptance {
    acceptanceId: string
    gigSeekerId: string
    visibilityId: string
    createdAt?: Date
    updatedAt?: Date
    status?: string
    acceptanceForm: string
}

export interface AcceptanceId {
    acceptanceId: string
}

export interface GigSeekerIdAcceptanceId {
    gigSeekerId?: string
    acceptanceId?: string
}

export interface Status {
    gigSeekerId: string
    gigId: string
    status: string
}

export interface Transactions {
    transactionId: string
    gigId: string
    gigSeekerId: string
    approvedBy?: string
    isVerified?: number
    amount: number
    gigTitle: string
    transactionStatus: 'failed' | 'success' | 'pending' | 'initiated'
    paymentMethod?: string
    tasksCompleted: string
    transactionType: 'credit' | 'debit'
    gigStartedOn?: Date
    gigEndedOn?: Date
    createdAt?: Date
    updatedAt?: Date
}