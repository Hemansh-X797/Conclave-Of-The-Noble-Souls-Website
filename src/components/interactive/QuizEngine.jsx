import React, { useState, useEffect } from 'react';
import ' @/styles/interactive.css';

const QuizEngine = ({
  quizData,
  onComplete,
  pathway = 'default',
  showProgress = true,
  allowBack = true,
  className = '',
  ...props
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState(null);

  const quiz = quizData || DEFAULT_PATHWAY_QUIZ;
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResults();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateResults = () => {
    const scores = {
      gaming: 0,
      lorebound: 0,
      productive: 0,
      news: 0
    };

    quiz.questions.forEach(question => {
      const answer = answers[question.id];
      if (answer && question.scoring) {
        Object.entries(question.scoring[answer] || {}).forEach(([pathway, points]) => {
          scores[pathway] = (scores[pathway] || 0) + points;
        });
      }
    });

    const total = Object.values(scores).reduce((sum, val) => sum + val, 0);
    const percentages = {};
    Object.keys(scores).forEach(key => {
      percentages[key] = total > 0 ? Math.round((scores[key] / total) * 100) : 0;
    });

    const topPathway = Object.entries(percentages).sort((a, b) => b[1] - a[1])[0][0];

    setResults({
      scores: percentages,
      topPathway,
      recommendation: PATHWAY_RECOMMENDATIONS[topPathway]
    });
    setIsComplete(true);
    
    if (onComplete) {
      onComplete({ scores: percentages, topPathway });
    }
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsComplete(false);
    setResults(null);
  };

  const currentQ = quiz.questions[currentQuestion];
  const hasAnswer = answers[currentQ?.id] !== undefined;

  if (isComplete && results) {
    return (
      <div className={`quiz-engine-container ${pathway}-realm ${className}`} {...props}>
        <div className="quiz-engine-card">
          <div className="quiz-results-container">
            <div className="quiz-results-icon">{PATHWAY_ICONS[results.topPathway]}</div>
            <h2 className="quiz-results-title">{results.recommendation.title}</h2>
            <p className="quiz-results-subtitle">{results.recommendation.subtitle}</p>
            <p className="quiz-results-description">{results.recommendation.description}</p>

            <div className="quiz-results-pathways">
              {Object.entries(results.scores)
                .sort((a, b) => b[1] - a[1])
                .map(([pathway, score]) => (
                  <div key={pathway} className="quiz-result-pathway">
                    <div className="quiz-result-pathway-icon">{PATHWAY_ICONS[pathway]}</div>
                    <div className="quiz-result-pathway-name">
                      {pathway.charAt(0).toUpperCase() + pathway.slice(1)}
                    </div>
                    <div className={`quiz-result-pathway-score ${pathway}`}>{score}%</div>
                  </div>
                ))}
            </div>

            <div className="quiz-actions">
              <button className="quiz-nav-btn" onClick={handleRetake}>
                Retake Quiz
              </button>
              <button className="quiz-nav-btn primary" onClick={() => window.location.href = `/pathways/${results.topPathway}`}>
                Explore {results.topPathway.charAt(0).toUpperCase() + results.topPathway.slice(1)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`quiz-engine-container ${pathway}-realm ${className}`} {...props}>
      <div className="quiz-engine-card">
        <div className="quiz-header">
          <h1 className="quiz-title">{quiz.title}</h1>
          <p className="quiz-subtitle">{quiz.subtitle}</p>
          {quiz.description && <p className="quiz-description">{quiz.description}</p>}
        </div>

        {showProgress && (
          <div className="quiz-progress-container">
            <div className="quiz-progress-bar">
              <div 
                className="quiz-progress-fill" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="quiz-progress-text">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </div>
          </div>
        )}

        <div className="quiz-question-container">
          <div className="quiz-question-number">Question {currentQuestion + 1}</div>
          <h3 className="quiz-question-text">{currentQ.question}</h3>

          {currentQ.type === 'multiple-choice' && (
            <div className="quiz-options">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${answers[currentQ.id] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswer(currentQ.id, index)}
                  data-cursor="hover"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {currentQ.type === 'scale' && (
            <div className="quiz-scale-container">
              <div className="quiz-scale-labels">
                <span className="quiz-scale-label">{currentQ.scaleLabels[0]}</span>
                <span className="quiz-scale-label">{currentQ.scaleLabels[1]}</span>
              </div>
              <div className="quiz-scale-options">
                {[1, 2, 3, 4, 5].map(value => (
                  <button
                    key={value}
                    className={`quiz-scale-option ${answers[currentQ.id] === value ? 'selected' : ''}`}
                    onClick={() => handleAnswer(currentQ.id, value)}
                    data-cursor="hover"
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="quiz-navigation">
          <button
            className="quiz-nav-btn"
            onClick={handleBack}
            disabled={!allowBack || currentQuestion === 0}
            data-cursor="hover"
          >
            Back
          </button>
          <button
            className="quiz-nav-btn primary"
            onClick={handleNext}
            disabled={!hasAnswer}
            data-cursor="hover"
          >
            {currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Default Pathway Quiz
const DEFAULT_PATHWAY_QUIZ = {
  title: 'Discover Your Path',
  subtitle: 'Find your perfect realm in The Conclave',
  description: 'Answer these questions to discover which pathway suits you best',
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question: 'How do you prefer to spend your free time?',
      options: [
        'Playing competitive games and strategizing',
        'Reading stories, watching anime, or exploring fiction',
        'Learning new skills and working on personal projects',
        'Staying updated with current events and discussing trends'
      ],
      scoring: {
        0: { gaming: 3 },
        1: { lorebound: 3 },
        2: { productive: 3 },
        3: { news: 3 }
      }
    },
    {
      id: 'q2',
      type: 'multiple-choice',
      question: 'What motivates you the most?',
      options: [
        'Winning and achieving high scores',
        'Discovering compelling narratives and characters',
        'Accomplishing goals and self-improvement',
        'Being informed and sharing knowledge'
      ],
      scoring: {
        0: { gaming: 3 },
        1: { lorebound: 3 },
        2: { productive: 3 },
        3: { news: 3 }
      }
    },
    {
      id: 'q3',
      type: 'scale',
      question: 'I prefer fast-paced action over slow, thoughtful experiences',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { lorebound: 2, productive: 1 },
        2: { lorebound: 1, productive: 1 },
        3: { gaming: 1, news: 1 },
        4: { gaming: 2, news: 1 },
        5: { gaming: 3, news: 2 }
      }
    },
    {
      id: 'q4',
      type: 'multiple-choice',
      question: 'Which community role appeals to you?',
      options: [
        'Tournament organizer or team captain',
        'Storyteller or content creator',
        'Mentor or workshop leader',
        'Moderator or discussion facilitator'
      ],
      scoring: {
        0: { gaming: 3 },
        1: { lorebound: 3 },
        2: { productive: 3 },
        3: { news: 3 }
      }
    },
    {
      id: 'q5',
      type: 'scale',
      question: 'I enjoy competition more than collaboration',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { lorebound: 2, productive: 2 },
        2: { lorebound: 1, productive: 1 },
        3: { gaming: 1, news: 1 },
        4: { gaming: 2, news: 1 },
        5: { gaming: 3 }
      }
    },
    {
      id: 'q6',
      type: 'multiple-choice',
      question: 'What type of content do you consume most?',
      options: [
        'Gaming streams, esports, and gameplay videos',
        'Anime, manga, novels, and fantasy content',
        'Educational videos, tutorials, and self-help',
        'News channels, documentaries, and analysis'
      ],
      scoring: {
        0: { gaming: 3 },
        1: { lorebound: 3 },
        2: { productive: 3 },
        3: { news: 3 }
      }
    },
    {
      id: 'q7',
      type: 'scale',
      question: 'I prefer structured goals over open-ended exploration',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { lorebound: 2 },
        2: { lorebound: 1, news: 1 },
        3: { gaming: 1, productive: 1 },
        4: { gaming: 1, productive: 2 },
        5: { productive: 3, gaming: 1 }
      }
    },
    {
      id: 'q8',
      type: 'multiple-choice',
      question: 'What describes your ideal evening?',
      options: [
        'Intense gaming session with friends',
        'Binge-watching a new anime series',
        'Working on a personal project or learning',
        'Discussing current events and debating topics'
      ],
      scoring: {
        0: { gaming: 3 },
        1: { lorebound: 3 },
        2: { productive: 3 },
        3: { news: 3 }
      }
    }
  ]
};

// MBTI-Style Quiz
export const MBTI_QUIZ = {
  title: 'Personality Alignment',
  subtitle: 'Discover your interaction style',
  description: 'Understanding your personality helps us recommend the best experiences',
  questions: [
    {
      id: 'mbti1',
      type: 'scale',
      question: 'I gain energy from being around people',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { lorebound: 2, productive: 1 },
        2: { lorebound: 1 },
        3: {},
        4: { gaming: 1, news: 1 },
        5: { gaming: 2, news: 2 }
      }
    },
    {
      id: 'mbti2',
      type: 'scale',
      question: 'I focus on concrete facts over abstract concepts',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { lorebound: 2 },
        2: { lorebound: 1 },
        3: {},
        4: { productive: 1, news: 1 },
        5: { productive: 2, news: 2 }
      }
    },
    {
      id: 'mbti3',
      type: 'scale',
      question: 'I make decisions based on logic over feelings',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { lorebound: 2 },
        2: { lorebound: 1 },
        3: { gaming: 1 },
        4: { productive: 1, gaming: 1 },
        5: { productive: 2, news: 1 }
      }
    },
    {
      id: 'mbti4',
      type: 'scale',
      question: 'I prefer to plan ahead rather than be spontaneous',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { gaming: 1, lorebound: 1 },
        2: { gaming: 1 },
        3: {},
        4: { productive: 1, news: 1 },
        5: { productive: 2, news: 1 }
      }
    },
    {
      id: 'mbti5',
      type: 'scale',
      question: 'I enjoy discussing theories and possibilities',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { gaming: 1 },
        2: { productive: 1 },
        3: {},
        4: { lorebound: 1, news: 1 },
        5: { lorebound: 2, news: 1 }
      }
    },
    {
      id: 'mbti6',
      type: 'scale',
      question: 'I value harmony in groups over being right',
      scaleLabels: ['Strongly Disagree', 'Strongly Agree'],
      scoring: {
        1: { gaming: 1, news: 1 },
        2: {},
        3: {},
        4: { lorebound: 1, productive: 1 },
        5: { lorebound: 2 }
      }
    }
  ]
};

// Pathway Recommendations
const PATHWAY_RECOMMENDATIONS = {
  gaming: {
    title: 'Gaming Realm',
    subtitle: 'The Digital Battlefield Awaits',
    description: 'Your competitive spirit and strategic mindset make you perfect for the Gaming Realm. Join tournaments, form teams, and dominate leaderboards with fellow warriors.',
    suggestedRoles: ['Competitive Player', 'Team Captain', 'Tournament Organizer']
  },
  lorebound: {
    title: 'Lorebound Sanctuary',
    subtitle: 'The Mystical Realm of Stories',
    description: 'Your love for narratives and imagination draws you to the Lorebound Sanctuary. Dive into anime, manga, and endless tales with fellow enthusiasts.',
    suggestedRoles: ['Storyteller', 'Lore Keeper', 'Content Creator']
  },
  productive: {
    title: 'Productive Palace',
    subtitle: 'The Realm of Excellence',
    description: 'Your drive for self-improvement and goal achievement makes the Productive Palace your ideal path. Master new skills and inspire others on their journey.',
    suggestedRoles: ['Mentor', 'Workshop Leader', 'Productivity Expert']
  },
  news: {
    title: 'News Nexus',
    subtitle: 'The Information Hub',
    description: 'Your curiosity and desire to stay informed make you perfect for the News Nexus. Discuss current events, share insights, and debate with intellectuals.',
    suggestedRoles: ['Moderator', 'Discussion Leader', 'News Curator']
  }
};

// Pathway Icons
const PATHWAY_ICONS = {
  gaming: '⚔️',
  lorebound: '✦',
  productive: '⚡',
  news: '◆'
};

// Pre-built Quiz Components
export const PathwayQuiz = (props) => (
  <QuizEngine quizData={DEFAULT_PATHWAY_QUIZ} {...props} />
);

export const MBTIQuiz = (props) => (
  <QuizEngine quizData={MBTI_QUIZ} {...props} />
);

export default QuizEngine;