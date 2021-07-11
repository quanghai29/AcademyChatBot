import {
  SET_CODE,
  SET_VERIFY_CODE_RESPONSE,
  SET_ENTIRE_VERIFY_CODE_FORM_STATE
} from '../constants/actionTypes';

export const setVerifyCodeAction = (data)=>{
  return {
    type: SET_CODE,
    payload: {...data}
  }
}

export const setResponseAction= (data)=>{
  return {
    type: SET_VERIFY_CODE_RESPONSE,
    payload: {...data}
  }
}

export const setEntireVerifyCodeFormStateAction = (data)=>{
  return {
    type: SET_ENTIRE_VERIFY_CODE_FORM_STATE,
    payload: {...data}
  }
}