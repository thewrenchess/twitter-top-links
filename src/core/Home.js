import React, { useState, useEffect } from 'react'
import Layout from './Layout'
import {
  TwitterTimelineEmbed,
  TwitterTweetEmbed
} from 'react-twitter-embed'
import {
  get_request_token,
  is_signed_in,
  sign_out
} from '../auth'
import { get_tweets } from '../tweets'
import '../assets/bootstrap-social.css'

const Home = () => {
  const feed_window_style = {
    height: `${window.innerHeight - 200}px`,
    overflow: 'scroll'
  }
  const cog_style = {
    color: '#5CB8FF',
    'fontSize': '100px'
  }

  const [is_loading, set_is_loading] = useState(false)
  const [user, set_user] = useState(is_signed_in())
  const [tweets, set_tweets] = useState([])
  const [filtered_tweets, set_filtered_tweets] = useState([])
  const [search_query, set_search_query] = useState('')

  const siginin = (event) => {
    event.preventDefault()
    get_request_token()
      .then(data => {
        const { auth_url } = data
        if (auth_url) {
          window.location = auth_url
        }
      })
      .catch(err => console.log(err))
  }

  const signout = (event) => {
    event.preventDefault()
    set_user(null)
    sign_out()
  }

  const handle_search_query_change = () => event => {
    const search_query = event.target.value
    set_search_query(search_query)
  }

  useEffect(() => {
    const sort_tweets = (tweets) => {
      return tweets.sort((a, b) => {
        const a_created_at = new Date(a.tweet_created_at)
        const b_created_at = new Date(b.tweet_created_at)
        return b_created_at - a_created_at
      })
    }

    if (user) {
      set_is_loading(true)
      get_tweets(user.user_id)
        .then(data => {
          const {
            tweet_array
          } = data
          const _tweets = sort_tweets(tweet_array)
          set_tweets(_tweets)
          console.log(_tweets[0])
          set_is_loading(false)
        })
        .catch(err => console.log(err))
    }
  }, [user])

  useEffect(() => {
    if (search_query) {
      const filtered_tweets = tweets.filter(tweet => {
        const query_lowercase = search_query.toLowerCase()
        const location = tweet.location || ''
        const hashtags = tweet.hashtags || []

        const has_matching_string = (target) => {
          return target.toLowerCase().includes(query_lowercase)
        }

        return has_matching_string(location)
          || hashtags.some(hashtag => has_matching_string(hashtag))
      })
      set_filtered_tweets(filtered_tweets)
    } else {
      set_filtered_tweets(tweets)
    }
  }, [tweets, search_query])

  return (
    <Layout
      title='Twitter Top Links'
      description={ user && user.screen_name ? (
        `Hello @${user.screen_name}`
      ) : 'Log in to discover top links in your feed!' }
      class_name='container'
    >
      {
        user && user.user_id && user.screen_name ? (
          <div className='row'>
            <div
              className='col-md-8'
              style={ feed_window_style }
            >
              {
                is_loading ? (
                  <i
                    className='fa fa-cog fa-spin'
                    style={ cog_style }
                  />
                ) : (
                  filtered_tweets.map(tweet => (
                    <TwitterTweetEmbed
                      key={ tweet.tweet_id }
                      tweetId={ tweet.tweet_id }
                    />
                  ))
                )
              }
            </div>
            <div className='col-md-4'>
              <form>
                <div className='form-group'>
                  <input
                    onChange={ handle_search_query_change() }
                    type='text'
                    className='form-control'
                    placeholder='Search location and hashtags'
                  />
                </div>
              </form>
              <TwitterTimelineEmbed
                sourceType="profile"
                userId={ user.user_id }
                options={{ height: 400 }}
              />
              <button
                onClick={ signout }
                className='btn btn-block btn-social btn-twitter text-center'
              >
                Sign out from Twitter
              </button>
            </div>
          </div>
        ) : (
          <div className='row'>
            <div className='col-md-4 offset-md-4'>
              <button
                onClick={ siginin }
                className='btn btn-block btn-social btn-twitter text-center'
              >
                <span className='fa fa-twitter'></span> Sign in with Twitter
              </button>
            </div>
          </div>
        )
      }
    </Layout>
  )
}

export default Home
