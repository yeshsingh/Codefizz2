import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './ProblemStatement.module.css';
import { IoIosArrowDown, IoIosArrowUp, IoMdBookmark } from "react-icons/io";
import { useAuthContext } from '../../hooks/useAuthContext';

const ProblemStatement = () => {
  const { titleSlug } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solution, setSolution] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [solutions, setSolutions] = useState([]);
  const [showSolutions, setShowSolutions] = useState(false);
  const [activeSolution, setActiveSolution] = useState(null);
  const [comments, setComments] = useState({});
  const [alertShown, setAlertShown] = useState(false);

  const navigate = useNavigate();
  const { userLogin, isAuthenticated } = useAuthContext();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (userLogin) {
      fetchBookmarks(userLogin.result._id);
    }
  }, [userLogin]);

  const fetchBookmarks = async (userId) => {
    try {
      const response = await fetch(`/user/bookmarks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        const allSolutionIds = data.reduce((acc, bookmark) => {
          bookmark.solutions.forEach(solution => {
            acc.push(solution.solutionId._id);
          });
          return acc;
        }, []);
        setBookmarks(allSolutionIds);
      } else {
        console.error('Failed to fetch bookmarks');
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  useEffect(() => {
    const fetchProblemStatement = async () => {
      try {
        const response = await fetch(`https://alfa-leetcode-api.onrender.com/select?titleSlug=${titleSlug}`);
        if (response.ok) {
          const data = await response.json();
          setProblem(data);
        } else {
          setError('Failed to fetch problem statement');
        }
      } catch (error) {
        setError('Failed to fetch problem statement');
      } finally {
        setLoading(false);
      }
    };
    fetchProblemStatement();
  }, [titleSlug]);

  const handleSolutionChange = (e) => {
    setSolution(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handlePostSolution = async () => {
    if (!isAuthenticated) {
      if (!alertShown) {
        alert('You need to be logged in to post a solution.');
        setAlertShown(true);
        navigate('/login');
      }
      return;
    }
    try {
      const response = await fetch('/user/solutions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userLogin.result._id,
          titleSlug,
          title: problem.questionTitle,
          solution,
          language,
          username: userLogin.result.username,
          topicTags: problem.topicTags,
        }),
      });
      if (response.ok) {
        alert('Solution posted successfully');
        setSolution('');
      } else {
        alert('Failed to post solution');
      }
    } catch (error) {
      console.error('Error posting solution:', error);
      alert('Error posting solution');
    }
  };

  const handleBookmark = async (sol) => {
    const isBookmarked = bookmarks.includes(sol._id);

    if (!isBookmarked) {
      try {
        const response = await fetch('/user/bookmarks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            solutionId: sol._id,
            userId: userLogin.result._id,
            title: problem.questionTitle,
            titleSlug,
            language: sol.language,
            solution: sol.solution,
            topicTags: problem.topicTags,
          }),
        });
        if (response.ok) {
          setBookmarks((prevBookmarks) => [...prevBookmarks, sol._id]);
          alert('Solution bookmarked successfully');
        } else {
          alert('Failed to bookmark solution');
        }
      } catch (error) {
        console.error('Error bookmarking solution', error);
        alert('Failed to bookmark solution');
      }
    } else {
      try {
        const response = await fetch(`/user/bookmarks/${userLogin.result._id}/${titleSlug}/${sol._id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setBookmarks((prevBookmarks) => prevBookmarks.filter((id) => id !== sol._id));
          alert('Solution unbookmarked successfully');
        } else {
          const errorResponse = await response.json();
          console.error('Error unbookmarking solution:', errorResponse.error);
          alert('Failed to unbookmark solution');
        }
      } catch (error) {
        console.error('Error unbookmarking solution:', error);
        alert('Failed to unbookmark solution');
      }
    }
  };

  const handlePostComment = async (solutionId, comment) => {
    try {
      const response = await fetch(`/user/comments/${solutionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: userLogin.result._id, comment }),
      });
      if (response.ok) {
        fetchComments(solutionId); // Fetch comments again to refresh the list
      } else {
        console.error('Failed to post comment');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const fetchComments = async (solutionId) => {
    try {
      const response = await fetch(`/user/comments/${solutionId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(prevComments => ({
          ...prevComments,
          [solutionId]: data.comments,
        }));
      } else {
        console.error('Failed to fetch comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const toggleShowSolutions = () => {
    setShowSolutions(!showSolutions);
  };

  const handleSelectSolution = (solutionId) => {
    setActiveSolution(solutionId);
    fetchComments(solutionId);
  };

  const handleAddComment = (solutionId) => {
    const comment = prompt('Enter your comment:');
    if (comment) {
      handlePostComment(solutionId, comment);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className={styles.problemStatement}>
      <h1>{problem.questionTitle}</h1>
      <div dangerouslySetInnerHTML={{ __html: problem.content }} />

      <div className={styles.solutionSection}>
        <h2>Post your solution</h2>
        <select value={language} onChange={handleLanguageChange}>
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
        <textarea
          value={solution}
          onChange={handleSolutionChange}
          placeholder="Write your solution here..."
          rows="10"
          cols="50"
        />
        <button onClick={handlePostSolution}>Post Solution</button>
      </div>
      <div className={styles.solutionsContainer}>
        <h2>
          Solutions
          {showSolutions ? (
            <IoIosArrowUp className={styles.toggleIcon} onClick={toggleShowSolutions} />
          ) : (
            <IoIosArrowDown className={styles.toggleIcon} onClick={toggleShowSolutions} />
          )}
        </h2>
        {showSolutions && (
          <div>
            {problem.solutions.map((sol, index) => (
              <div key={index} className={styles.solutionItem}>
                <div className={styles.solutionHeader}>
                  <span>Language: {sol.language}</span>
                  <button
                    className={styles.bookmarkButton}
                    onClick={() => handleBookmark(sol)}
                  >
                    <IoMdBookmark className={bookmarks.includes(sol._id) ? styles.bookmarked : ''} />
                  </button>
                  <button onClick={() => handleSelectSolution(sol._id)}>View Comments</button>
                </div>
                <SyntaxHighlighter language={sol.language} style={okaidia}>
                  {sol.solution}
                </SyntaxHighlighter>
                {activeSolution === sol._id && (
                  <div className={styles.commentsContainer}>
                    <h3>Comments</h3>
                    <button onClick={() => handleAddComment(sol._id)}>Add Comment</button>
                    {comments[sol._id] && comments[sol._id].length > 0 ? (
                      comments[sol._id].map((comment, index) => (
                        <div key={index} className={styles.commentItem}>
                          <span>{comment.username}: {comment.comment}</span>
                        </div>
                      ))
                    ) : (
                      <div>No comments yet</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemStatement;
