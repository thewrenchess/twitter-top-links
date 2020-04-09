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
  const [locations, set_locations] = useState([])
  const [search_query, set_search_query] = useState('')
  const [location_filter, set_location_filter] = useState('')

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
    const _search_query = event.target.value
    set_search_query(_search_query)
  }

  const handle_location_change = () => event => {
    const _location_filter = event.target.value
    set_location_filter(_location_filter)
  }

  useEffect(() => {
    const sort_tweets = (tweets) => {
      return tweets.sort((a, b) => {
        const a_created_at = new Date(a.tweet_created_at)
        const b_created_at = new Date(b.tweet_created_at)
        return b_created_at - a_created_at
      })
    }

    const get_location_set = () => {
      const location_array = filtered_tweets
        .filter(tweet => !!tweet.location)
        .map(tweet => tweet.location)
      const location_set = new Set(location_array)
      return [...location_set]
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
          const _locations = get_location_set(tweet_array)
          set_locations(_locations)
          set_is_loading(false)
        })
        .catch(err => console.log(err))
    }
  }, [user])

  useEffect(() => {
    const filter_tweets = (search_query, location_filter) => {
      let _filtered_tweets
  
      if (search_query) {
        _filtered_tweets = tweets.filter(tweet => {
          const hashtags = tweet.hashtags || []
  
          return hashtags.some(hashtag => {
            return hashtag.toLowerCase().includes(search_query.toLowerCase())
          })
        })
      }

      if (location_filter) {
        _filtered_tweets = _filtered_tweets.filter(tweet => tweet.location === location_filter)
      }

      return _filtered_tweets
    }

    if (search_query || location_filter) {
      const _filtered_tweets = filter_tweets(search_query, location_filter)
      set_filtered_tweets(_filtered_tweets)
    } else {
      set_filtered_tweets(tweets)
    }
  }, [tweets, search_query, location_filter])

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
                    placeholder='Search hashtags'
                  />
                </div>
                <select
                  onChange={ handle_location_change() }
                  className='form-control'
                >
                  <option value=''>Click to Choose Location</option>
                  {
                    locations.map((location, index) => (
                      <option
                        key={ index }
                        value={ location }
                      >
                        { location }
                      </option>
                    ))
                  }
                </select>
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
