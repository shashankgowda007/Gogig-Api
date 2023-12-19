export interface CompanyDetails {
    companyId: string
    companyName: string
    contactNumber: string
    contactEmail: string
    companyLogo?: string
    industry?: string
    size?: string
    website?: string
    description?: string
    location?: string
    socialMedia?: string
    createdBy: string
    isVerified?: number
}

export interface CreatedById {
    createdBy: string
}

export interface CompanyDetailsUpdate {
    companyId: string
    companyName?: string
    contactNumber?: string
    contactEmail?: string
    companyLogo?: string
    industry?: string
    size?: string
    website?: string
    description?: string
    location?: string
    socialMedia?: string
    createdBy: string
}