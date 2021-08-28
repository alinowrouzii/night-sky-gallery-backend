
exports.userTypes = {
    ADMIN: 'ADMIN',
    SUBSCRIBER: 'SUBSCRIBER',
    SUPER_ADMIN: 'SUPER_ADMIN'
}


exports.userStatus = {
    PENDING: 'PENDING',
    //SUPER ADMIN PENDING is for user that requested for administration and waiting for super admin to accept him
    SUPER_ADMIN_PENDING:'SUPER_ADMIN_PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED'
}