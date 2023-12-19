export interface EmployerDetails {
    employerId: string
    companyId?: string
    name?: string
    emailId?: string
    phoneNumber?: string
    jobTitle?: string
    bio?: string
    isVerified?: number
}

export interface EmployerId {
    employerId: string
}

export interface EmployerDetailsUpdate {
    employerId: string
    name?: string
    emailId?: string
    phoneNumber?: string
    jobTitle?: string
    bio?: string
}