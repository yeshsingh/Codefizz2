import React, { useState, useEffect } from "react";
import TagFilter from "../../components/TagFilter/TagFilter";
import Pagination from "../../components/Pagination/Pagination";
import "./Questions.css";
import axios from "axios" ;
const Questions = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const questionsPerPage = 40; // Number of questions to display per page

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response2 = await axios(`https://localhost:8008/get-data`);
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/problems?limit=20`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const data2 = await response2 ;
        console.log(data2) ;
        setProblems(data.problemsetQuestionList);
      } catch (error) {
        setError("Failed to fetch problems");
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const indexOfLastQuestion = currentPage * questionsPerPage;
  const indexOfFirstQuestion = indexOfLastQuestion - questionsPerPage;

  const filteredProblems = problems.filter(
    (problem) =>
      selectedTags.length === 0 ||
      problem.topicTags.some((tag) => selectedTags.includes(tag.name))
  );
  const result = {};

    // Initialize result object with empty arrays for each topic
    selectedTags.forEach(topic => {
        result[topic] = [];
    });

    // Map the data to the result object
    // data.forEach(topicData => {
    //     if (result[topicData.topicName]) {
    //         result[topicData.topicName] = topicData.questions;
    //     }
    // });
  
  const currentQuestions = filteredProblems.slice(
    indexOfFirstQuestion,
    indexOfLastQuestion
  );

  const allTags = [
    ...new Set(
      problems.flatMap((problem) => problem.topicTags.map((tag) => tag.name))
    ),
  ];

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleTagChange = (tag) => {
    setSelectedTags((prevSelectedTags) =>
      prevSelectedTags.includes(tag)
        ? prevSelectedTags.filter((t) => t !== tag)
        : [...prevSelectedTags, tag]
    );
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const totalPages = Math.ceil(filteredProblems.length / questionsPerPage);

  return (
    <>
      <div className="questions-list">
        <TagFilter
          tags={allTags}
          selectedTags={selectedTags}
          onTagChange={handleTagChange}
        />

        {currentQuestions.map((problem, index) => (
          <div key={index} className="question-item">
            <div className="question-title">{problem.title}</div>
            <div className="question-links">
              <a
                href={`https://leetcode.com/problems/${problem.titleSlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/img-logo-leetcode.png"
                  alt="LeetCode"
                  className="logo"
                />
              </a>
              <a
                href={`https://practice.geeksforgeeks.org/problems/${problem.titleSlug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="/img-logo-gfg.png"
                  alt="GeeksforGeeks"
                  className="logo"
                />
              </a>
            </div>
            <div className="question-tags">
              {problem.topicTags.map((tag, tagIndex) => (
                <span key={tagIndex} className="tag">
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
      />
    </>
  );
};

export default Questions;
