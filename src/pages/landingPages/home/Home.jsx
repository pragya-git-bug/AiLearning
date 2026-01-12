import React from 'react'
import LandingAppBar from '../../../components/appBar/LandingAppBar'
import HomeHero from './homeHeroPages/HomeHero'
import Footer from './homeHeroPages/Footer'

const Home = () => {
  return (
    <div>
        <LandingAppBar/>
        <HomeHero />
        <Footer />
    </div>
  )
}

export default Home