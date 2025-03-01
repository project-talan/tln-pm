
const errorMsgTpmServe = "Ensure that the 'tpm serve' command is running and that a valid configuration file exists in the root of your project.";
const errorMsgFetchingInfo = `Failed to fetch backend info. ${errorMsgTpmServe}`;
const errorMsgFetchingDocs = `Failed to fetch docs. ${errorMsgTpmServe}`;
const errorMsgFetchingProjects = `Failed to fetch projects. ${errorMsgTpmServe}`;
const errorMsgFetchingWbs = `Failed to fetch WBS. ${errorMsgTpmServe}`;

export { errorMsgFetchingInfo, errorMsgFetchingDocs, errorMsgFetchingProjects, errorMsgFetchingWbs };