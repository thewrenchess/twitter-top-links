const API_URL = process.env.REACT_APP_API_URL
if (!API_URL) {
  throw new Error('missing API_URL')
}

const get_request_token = () => {
  return fetch(`${API_URL}/api/auth/request-token`, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(data => {
      const request_token_secret = data.request_token_secret || ''
      localStorage.setItem('t', request_token_secret)
      return data
    })
    .catch(err => err)
}

const save_user_to_local = (user) => {
  localStorage.setItem('jwt', JSON.stringify(user))
}

const get_user_from_local = (user) => {
  return JSON.parse(localStorage.getItem('jwt'))
}

const delete_user_from_local = (user) => {
  localStorage.removeItem('jwt')
}

const exchange_token = (data) => {
  const request_token_secret = localStorage.getItem('t')
  localStorage.removeItem('t')

  return fetch(`${API_URL}/api/auth/exchange-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      ...data,
      request_token_secret
    })
  })
    .then(response => response.json())
    .then(user => {
      save_user_to_local(user)
      return user
    })
    .catch(err => err)
}

const is_signed_in = () => {
  return get_user_from_local()
}

const sign_out = () => {
  delete_user_from_local()
}

export {
  get_request_token,
  exchange_token,
  is_signed_in,
  sign_out
}