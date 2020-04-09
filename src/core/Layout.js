import React from 'react'

const Layout = ({
  title = 'Title',
  description = 'Description',
  class_name = '',
  children
}) => {
  const hero_style = {
    backgroundColor: '#A8D9FF',
    padding: '2rem'
  }

  return (
    <div>
      <div
        className='jumbotron'
        style={ hero_style }
      >
        <h2>
          { title }
        </h2>
        <p className='lead'>
          { description }
        </p>
      </div>
      <div className={ class_name }>
        { children }
      </div>
    </div>
  )
}

export default Layout
