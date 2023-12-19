export interface Response_POST {
    responseId: string
    id: string
    gigSeekerId: string
    callStatus?: string
    questionaireResponse?: string
}
export interface Response_UPDATE {
    responseId: string
    id?: string
    gigSeekerId?: string
    callStatus?: string
    questionaireResponse?: string

}
export interface Response_GET_ResponseId {
    responseId: string
}

export interface Response_GET_GigSeekerId {
    gigSeekerId: string
    gigId?: string
}
export interface GigDetails_GET_GigId {
    gigId: string
}

export interface GigDetails {
    gigId?: string
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
}