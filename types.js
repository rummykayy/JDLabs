export const InterviewMode = {
    VIDEO: 'Video Interview',
    AUDIO: 'Audio Interview',
    CHAT: 'Chat Interview',
    LIVE_SHARE: 'Live Share Interview',
};
export var AuditAction;
(function (AuditAction) {
    // User actions
    AuditAction["USER_LOGIN"] = "USER_LOGIN";
    AuditAction["USER_LOGOUT"] = "USER_LOGOUT";
    AuditAction["USER_REGISTER"] = "USER_REGISTER";
    AuditAction["USER_PROFILE_UPDATE"] = "USER_PROFILE_UPDATE";
    AuditAction["USER_PLAN_CHANGE"] = "USER_PLAN_CHANGE";
    // Interview actions
    AuditAction["INTERVIEW_CREATE"] = "INTERVIEW_CREATE";
    AuditAction["INTERVIEW_FINALIZE"] = "INTERVIEW_FINALIZE";
    AuditAction["INTERVIEW_SCHEDULE"] = "INTERVIEW_SCHEDULE";
    // Report/Feedback actions
    AuditAction["REPORT_CREATE"] = "REPORT_CREATE";
    AuditAction["COMMENT_CREATE"] = "COMMENT_CREATE";
    // Application/Hiring actions
    AuditAction["APPLICATION_UPDATE_STATUS"] = "APPLICATION_UPDATE_STATUS";
    // Compliance actions
    AuditAction["DATA_EXPORT"] = "DATA_EXPORT";
    AuditAction["DATA_DELETE"] = "DATA_DELETE";
})(AuditAction || (AuditAction = {}));
//# sourceMappingURL=types.js.map