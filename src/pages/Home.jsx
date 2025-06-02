// src/pages/Home.js
import React from 'react';
import Banner from '../components/Homepage/Banner';
import Top10 from '../components/Homepage/Top10Movies';
import MovieTheater from '../components/Homepage/MovieTheater';

const Home = () => {
    return (
        <div>
            <Banner />
            <Top10/>
            <MovieTheater/>
        </div>
    );
};

export default Home;