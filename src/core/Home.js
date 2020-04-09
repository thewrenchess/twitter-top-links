import React, { useState, useEffect, Fragment } from 'react'
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
    height: `${window.outerHeight - 220}px`,
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
  const [top_domains, set_top_domains] = useState([])
  const [top_linkers, set_top_linkers] = useState([])

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
    const _location_filter = event.target.value || ''
    set_location_filter(_location_filter)
  }

  const list_fragment = (title, item_array, item_prefix) => (
    <Fragment>
      <h5 className='mt-3'>
        { title }
      </h5>
      <ol>
        {
          item_array.map((item, index) => (
            <li
              key={ index }
            >
              { item_prefix }{ item }
            </li>
          ))
        }
      </ol>
    </Fragment>
  )

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

          if (!tweet_array) {
            return
          }

          const _tweets = sort_tweets(tweet_array)
          set_tweets(_tweets)
          set_is_loading(false)
        })
        .catch(err => console.log(err))
    }
  }, [user])

  useEffect(() => {
    const filter_tweets = (search_query, location_filter) => {
      let _filtered_tweets = [...tweets]
  
      if (search_query) {
        _filtered_tweets = _filtered_tweets.filter(tweet => {
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

  useEffect(() => {
    const get_domain_obj_array = () => {
      const LINK_REGEX = /^((http[s]?|ftp):\/)?\/?([^:\/\s]+)\/?/
      const domain_obj_array = []

      tweets.forEach(tweet => {
        const {
          screen_name,
          urls
        } = tweet

        urls.forEach(url => {
          const domain = (url.match(LINK_REGEX))[3]
          if (domain) {
            domain_obj_array.push({
              screen_name,
              domain
            })
          }
        })
      })

      return domain_obj_array
    }

    const sort_obj_by_count = (obj) => {
      return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, 10)
    }

    const get_top_10_domains = (domain_obj_array) => {
      const domain_count_obj = domain_obj_array
        .reduce((_domain_count_obj, domain_obj) => {
          const domain = domain_obj.domain
          if (_domain_count_obj[domain]) {
            _domain_count_obj[domain] += 1
          } else {
            _domain_count_obj[domain] += 1
          }
          return _domain_count_obj
        }, {})
      
      return sort_obj_by_count(domain_count_obj)
    }

    const get_top_10_linkers = (domain_obj_array) => {
      const linker_count_obj = domain_obj_array
        .reduce((_linker_count_obj, domain_obj) => {
          const screen_name = domain_obj.screen_name
          if (_linker_count_obj[screen_name]) {
            _linker_count_obj[screen_name] += 1
          } else {
            _linker_count_obj[screen_name] = 1
          }
          return _linker_count_obj
        }, {})
      
      return sort_obj_by_count(linker_count_obj)
    }

    const domain_obj_array = get_domain_obj_array()
    const _top_domains = get_top_10_domains(domain_obj_array)
    set_top_domains(_top_domains)
    const _top_linkers = get_top_10_linkers(domain_obj_array)
    set_top_linkers(_top_linkers)
  }, [tweets])

  useEffect(() => {
    const get_location_set = () => {
      const location_array = filtered_tweets
        .filter(tweet => !!tweet.location)
        .map(tweet => tweet.location)
      const location_set = new Set(location_array)
      return [...location_set]
    }
    const _locations = get_location_set()
    set_locations(_locations)
  }, [filtered_tweets])

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
                  <option selected>
                    Click to Choose Location
                  </option>
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
              {
                top_domains.length ? list_fragment(
                  'Top 10 Shared Domains',
                  top_domains
                ) : ''
              }
              {
                top_linkers.length ? list_fragment(
                  'Top 10 Link Sharer',
                  top_linkers,
                  '@'
                ) : ''
              }
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
