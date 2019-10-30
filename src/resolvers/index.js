import { GraphQLDate, GraphQLTime, GraphQLDateTime } from "graphql-iso-date";
import hello from "./query/hello";
import me from "./query/me";
import users from "./query/users";
import user from "./query/user";
import team from "./query/team";
import teams from "./query/teams";
import summaryCountTeams from "./query/summaryCountTeams";
import removeTeam from "./mutation/removeTeam";
import createTeam from "./mutation/createTeam";
import updateTeam from "./mutation/updateTeam";
import createUser from "./mutation/createUser";
import updateUser from "./mutation/updateUser";
import removeUser from "./mutation/removeUser";
import requestTeamMembership from "./mutation/requestTeamMembership";
import cancelTeamMembershipRequest from "./mutation/cancelTeamMembershipRequest";
import toggleTeamPermission from "./mutation/toggleTeamPermission";
import removeTeamPermission from "./mutation/removeTeamPermission";
import globalPermissions from "./user/globalPermissions";
import teamPermissions from "./user/teamPermissions";
// import userPermissions from "./team/userPermissions";
import userPermissionSummaryCounts from "./team/userPermissionsSummaryCounts";
import OLUserPermsTeam from "./OLUserPerms/team";
import OLTeamPermsUser from "./OLTeamPerms/user";
import requestLogin from "./mutation/requestLogin";
import register from "./mutation/register";
import confirmLogin from "./mutation/confirmLogin";
import writeFormValues from "./mutation/writeFormValues";
import form from "./query/form";
import value from "./formField/value";
import createForm from "./mutation/createForm";
import updateForm from "./mutation/updateForm";
import createGtib from "./mutation/createGtib";
import updateGtib from "./mutation/updateGtib";
import gtibs from "./query/gtibs";
import createTtib from "./mutation/createTtib";
import updateTtib from "./mutation/updateTtib";
import ttibs from "./query/ttibs";
import teamUsers from "./query/teamUsers";
import createTarget from "./mutation/createTarget";
import target from "./query/target";
import tibs from "./target/tibs";
import updateTarget from "./mutation/updateTarget";
import targets from "./query/targets";
import userTargets from "./query/userTargets";
import removeTarget from "./mutation/removeTarget";
import summaryCountMyTeamTargets from "./query/summaryCountMyTeamTargets";
import summaryTotalMyTeamHouseholdSize from "./query/summaryTotalMyTeamHouseholdSize";
import summaryCountMyTeamTibs from "./query/summaryCountMyTeamTibs";
import summaryCountAllTeamTargets from "./query/summaryCountAllTeamTargets";
import summaryTotalAllTeamHouseholdSize from "./query/summaryTotalAllTeamHouseholdSize";
import summaryTotalAllHouseholdSize from "./query/summaryTotalAllHouseholdSize";
import summaryCountAllTargets from "./query/summaryCountAllTargets";
import summaryCountAllTeamTibs from "./query/summaryCountAllTeamTibs";
import summaryCountAllTibs from "./query/summaryCountAllTibs";
import summaryCountAllTeamUsers from "./query/summaryCountAllTeamUsers";
import summaryCountAllUsers from "./query/summaryCountAllUsers";
import createTargetNote from "./mutation/createTargetNote";
import updateTargetNote from "./mutation/updateTargetNote";
import targetNoteCreatedBy from "./targetNote/createdBy";
import targetNoteLastEditedBy from "./targetNote/lastEditedBy";
import targetNoteTarget from "./targetNote/target";
import targetNote from "./query/targetNote";
import targetNotes from "./query/targetNotes";
import createTargetContactAttempt from "./mutation/createTargetContactAttempt";
import targetContactAttemptCreatedBy from "./targetContactAttempt/createdBy";
import targetContactAttemptLastEditedBy from "./targetContactAttempt/lastEditedBy";
import targetContactAttemptTarget from "./targetContactAttempt/target";
import updateTargetContactAttempt from "./mutation/updateTargetContactAttempt";
import targetContactAttempt from "./query/targetContactAttempt";
import targetContactAttempts from "./query/targetContactAttempts";
import createTaskDefinition from "./mutation/createTaskDefinition";
import taskDefCreatedBy from "./taskDefinition/createdBy";
import taskDefLastEditedBy from "./taskDefinition/lastEditedBy";
import taskDefForm from "./taskDefinition/form";
import taskAssignment from "./query/taskAssignment";
import taskAssignmentTaskDefinition from "./taskAssignment/taskDefinition";
import taskAssignmentTeam from "./taskAssignment/team";
import taskAssignmentAvailableTo from "./taskAssignment/availableTo";
import taskAssignmentAvailable from "./taskAssignment/available";
import taskAssignmentComplete from "./taskAssignment/complete";
import targetTasks from "./query/targetTasks";
import updateTargetTask from "./mutation/updateTargetTask";
import taskAssignmentNotAvailableUntilCompletionOf from "./taskAssignment/notAvailableUntilCompletionOf";
import teamEligibleTasks from "./query/teamEligibleTasks";
import designateTeamEligibleTask from "./mutation/designateTeamEligibleTask";
import taskDefinition from "./query/taskDefinition";
import createTaskAssignment from "./mutation/createTaskAssignment";
import setTaskAssignmentSortOrder from "./mutation/setTaskAssignmentSortOrder";
import updateTaskAssignment from "./mutation/updateTaskAssignment";
import supplementalFields from "./taskAssignment/supplementalFields";

export default {
  Query: {
    hello,
    me,
    users,
    user,
    team,
    teams,
    summaryCountTeams,
    form,
    gtibs,
    ttibs,
    teamUsers,
    target,
    targets,
    userTargets,
    summaryCountMyTeamTargets,
    summaryTotalMyTeamHouseholdSize,
    summaryCountMyTeamTibs,
    summaryCountAllTeamTargets,
    summaryTotalAllTeamHouseholdSize,
    summaryTotalAllHouseholdSize,
    summaryCountAllTargets,
    summaryCountAllTeamTibs,
    summaryCountAllTibs,
    summaryCountAllTeamUsers,
    summaryCountAllUsers,
    targetNote,
    targetNotes,
    targetContactAttempt,
    targetContactAttempts,
    taskAssignment,
    targetTasks,
    teamEligibleTasks,
    taskDefinition
  },
  Mutation: {
    createUser,
    updateUser,
    removeUser,
    createTeam,
    updateTeam,
    removeTeam,
    requestLogin,
    register,
    confirmLogin,
    requestTeamMembership,
    cancelTeamMembershipRequest,
    toggleTeamPermission,
    removeTeamPermission,
    writeFormValues,
    createForm,
    updateForm,
    createGtib,
    updateGtib,
    createTtib,
    updateTtib,
    createTarget,
    updateTarget,
    removeTarget,
    createTargetNote,
    updateTargetNote,
    createTargetContactAttempt,
    updateTargetContactAttempt,
    createTaskDefinition,
    updateTargetTask,
    designateTeamEligibleTask,
    createTaskAssignment,
    setTaskAssignmentSortOrder,
    updateTaskAssignment
  },
  User: {
    globalPermissions,
    teamPermissions
  },
  Team: {
    // userPermissions,
    userPermissionSummaryCounts
  },
  OLUserPerms: {
    team: OLUserPermsTeam
  },
  OLTeamPerms: {
    user: OLTeamPermsUser
  },
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime,
  FormField: {
    value
  },
  Target: {
    tibs
  },
  TargetNote: {
    createdBy: targetNoteCreatedBy,
    lastEditedBy: targetNoteLastEditedBy,
    target: targetNoteTarget
  },
  TargetContactAttempt: {
    createdBy: targetContactAttemptCreatedBy,
    lastEditedBy: targetContactAttemptLastEditedBy,
    target: targetContactAttemptTarget
  },
  TaskDefinition: {
    createdBy: taskDefCreatedBy,
    lastEditedBy: taskDefLastEditedBy,
    form: taskDefForm
  },
  TaskAssignment: {
    definition: taskAssignmentTaskDefinition,
    team: taskAssignmentTeam,
    availableTo: taskAssignmentAvailableTo,
    available: taskAssignmentAvailable,
    complete: taskAssignmentComplete,
    notAvailableUntilCompletionOf: taskAssignmentNotAvailableUntilCompletionOf,
    supplementalFields
  }
};
