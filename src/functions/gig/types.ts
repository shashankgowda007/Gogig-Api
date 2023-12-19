import { String } from "aws-sdk/clients/appstream"

export interface GigDetails {
    gigId: string
    companyId: string
    gigTitle: string
    archive?: number
    category?: string
    description?: string
    skillsRequired?: string
    academicQualificationRequired?: string
    budget?: number
    jobType?: string
    gigStartDate?: Date
    gigEndDate?: Date
    ageRestriction?: number
    site?: string
    location?: string,
    workingHours?: string
    status?: string
    communicationLanguages?: string
    fileUpload?: string
    tutorialUpload?: string
    postedByEmployerId?: string
    updatedByEmployerId?: string
    creationDate?: Date
    lastUpdated?: Date
    notes?: string
    questionaire?: JSON
    publishedAt?: Date
    completedAt?: Date
    isVerified?: number
    tags?: string
    minWagePerDay?: number
    minCallPerDay?: number
    pricePerClient?: number
}
export interface GigDetails_PATCH {
    gigId: string
    companyId?: string
    gigTitle?: string
    archive?: number
    category?: string
    description?: string
    skillsRequired?: string
    academicQualificationRequired?: string
    budget?: number
    jobType?: string
    gigStartDate?: Date
    gigEndDate?: Date
    ageRestriction?: number
    site?: string
    location?: string,
    workingHours?: string
    status?: string
    communicationLanguages?: string
    fileUpload?: string
    tutorialUpload?: string
    postedByEmployerId?: string
    updatedByEmployerId?: string
    creationDate?: Date
    lastUpdated?: Date
    notes?: string
    questionaire?: JSON
    publishedAt?: Date
    completedAt?: Date
    tags?: string
    minWagePerDay?: number
    minCallPerDay?: number
    pricePerClient?: number
}

export interface GetGigId {
    gigId: string
}
export interface GetCompanyId {
    companyId: string
}
export interface GetEmployerId {
    postedByEmployerId: String
}
export interface UpdateStatus {
    gigSeekerId: string
    gigId: string
    employerId: string
}

export interface UpdateQuestionaire {
    gigId: string
    postedByEmployerId: string
    questionaire: string

}
export interface GetQuestionaire {
    gigId: string
    postedByEmployerId: string
}