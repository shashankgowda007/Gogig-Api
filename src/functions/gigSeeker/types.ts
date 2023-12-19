export interface GigSeeker_POST {
    gigSeekerId: string
    firstName: string
    lastName: string
    phone: string
    email: string
    gender?: string
    dob?: Date
    languages?: string
    location?: string
    devices?: string
    maritalStatus?: string
    differentlyAbled?: string
    workExperience?: string
    industriesWorked?: string
    lastCompany?: string
    lastRole?: string
    personalIncomeRange?: string
    householdIncomeRange?: string
    whatsappNotification?: string
    currentStatus?: string
    highestQualification?: string
    fieldOfStudy?: string
    yearOfPassing?: string
    collegeName?: string
    availability?: string
    workLocation?: string
    travelPreference?: string
    availabilityTimeline?: string
    modeOfCommunication?: string
    skillSets?: string
    createdAt?: Date
    updatedAt?: Date
    isVerified?: number
    isTermAccepted?: number
    totalEarned?: number
    totalWithdrawn?: number
};
export interface GigSeeker_UPDATE {
    gigSeekerId: string
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
    gender?: string
    dob?: Date
    languages?: string
    location?: string
    devices?: string
    maritalStatus?: string
    differentlyAbled?: string
    workExperience?: string
    industriesWorked?: string
    lastCompany?: string
    lastRole?: string
    personalIncomeRange?: string
    householdIncomeRange?: string
    whatsappNotification?: string
    currentStatus?: string
    highestQualification?: string
    fieldOfStudy?: string
    yearOfPassing?: string
    collegeName?: string
    availability?: string
    workLocation?: string
    travelPreference?: string
    availabilityTimeline?: string
    modeOfCommunication?: string
    skillSets?: string
    createdAt?: Date
    updatedAt?: Date
    isVerified?: number
    isTermAccepted?: number
    totalEarned?: number
    totalWithdrawn?: number
};
export interface GigSeeker_REMOVE {
    gigSeekerId: string
}
export interface GigSeeker_GET {
    gigSeekerId: string
}