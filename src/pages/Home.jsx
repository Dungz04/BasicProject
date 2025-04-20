// src/pages/Home.js
import React from 'react';
import Banner from '../components/Banner';
import Top10 from '../components/Top10Movies';
import MovieTheater from '../components/MovieTheater';

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