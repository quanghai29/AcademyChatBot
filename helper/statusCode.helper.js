const Code = {
    Success: 200,
    Created_Success: 201,
    Created_Fail: 401,
    Deleted_Success: 204,
    Deleted_Fail: 404,
    Bad_Request : 400, // Request không đúng
    Unauthorized : 401, // Chưa xác thực
    Forbidden : 403,// không cho phép truy cập
    Not_Found: 404,
    Internal_Server_Error: 500
}

const Message = {
    Success: 'Success',
    Created_Success: 'Create Success',
    Created_Fail: 'Create Fail',
    Deleted_Success: 'Delete Success',
    Deleted_Fail: 'Delete Fail',
    Bad_Request : 'Bad Request', // Request không đúng
    Unauthorized : 'Not Authorized', // Chưa xác thực
    Forbidden : 'Not Allow Access',// không cho phép truy cập
    Not_Found: 'Request Not Found',
    Internal_Server_Error: 'Some thing is brokent'
}
module.exports = {
    Code, Message
};
