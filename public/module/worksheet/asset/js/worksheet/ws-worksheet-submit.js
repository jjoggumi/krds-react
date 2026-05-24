/**
 * worksheet ws-worksheet-submit.js
 * ver 0.1
 * 2021. 11. 15
 */

function checkExistsSignObj(signName) {
  return new Promise((resolve, reject) => {
    try {
      if (existsSignObj[signName]) {
        switch (signName) {
          case 'esign':
            applyUserSignObject.userSignImagePath && applyUserSignObject.userSignImagePath !== 'null'
              ? resolve(applyUserSignObject.userSignImagePath)
              : reject(false)
            break
          case 'approvalsign':
            approvalUserSignObject.userApprovalSignImagePath && approvalUserSignObject.userApprovalSignImagePath !== 'null'
              ? resolve(approvalUserSignObject.userApprovalSignImagePath)
              : reject(false)
            break
        }
      } else {
        resolve(true)
      }
    } catch (e) {
      reject(e)
    }
  })
}

function removeSign(payload) {
  const userId = payload.userId
  const signType = payload.signType
  let requestType = ''
  
  switch (signType) {
    case 'esign': {
      requestType = 'userSign'
      break
    }
    case 'approvalsign': {
      requestType = 'userApprovalSign'
      break
    }
  }
  
  const axiosRequest = {
    method: 'DELETE',
    url: `${apiUrl}/${requestType}/${userId}`,
    headers: {
      Authorization: 'Bearer ' + localStorage.idToken
    }
  }
  
  if (requestType) {
    return $axios(axiosRequest)
      .then(() => {
        window.location.reload()
      })
      .catch(err => {
        console.warn(err)
      })
  }
}