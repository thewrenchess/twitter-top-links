const API_URL = process.env.REACT_APP_API_URL
if (!API_URL) {
  throw new Error('missing API_URL')
}

const get_tweets = (user_id) => {
  return fetch(`${API_URL}/api/tweets/get-tweets?user_id=${user_id}`, {
    method: 'GET'
  })
    .then(response => response.json())
    .catch(err => err)
}

export {
  get_tweets
}
