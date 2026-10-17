import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  Code2,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  ChevronDown,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DSATrackerPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'solved' | 'todo' | 'bookmarked'
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [hideSolved, setHideSolved] = useState(false);
  const [collapsedPatterns, setCollapsedPatterns] = useState({});

  // Comprehensive DSA dataset matching index.html structure
  const [questions, setQuestions] = useState([
    // Tier 6: Core Arrays & Hashing
    { id: 't6-1', sno: 1, title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays & Hashing', pattern: 'Hash Map', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/two-sum/', notes: 'Use a hash map to store complements in O(N) time.' },
    { id: 't6-2', sno: 2, title: 'Valid Anagram', difficulty: 'Easy', topic: 'Arrays & Hashing', pattern: 'Frequency Counter', solved: true, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/', notes: 'Count character frequencies using an array or hash map.' },
    { id: 't6-3', sno: 3, title: 'Group Anagrams', difficulty: 'Medium', topic: 'Arrays & Hashing', pattern: 'Hash Map', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/', notes: 'Use sorted string or character count tuple as hash key.' },
    { id: 't6-4', sno: 4, title: 'Top K Frequent Elements', difficulty: 'Medium', topic: 'Heap / Priority Queue', pattern: 'Bucket Sort / Heap', solved: false, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/', notes: 'Min-heap of size k or bucket sort for O(N).' },
    { id: 't6-5', sno: 5, title: 'Product of Array Except Self', difficulty: 'Medium', topic: 'Arrays & Hashing', pattern: 'Prefix / Suffix Products', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/', notes: 'Compute left and right running products without division operator.' },
    { id: 't6-6', sno: 6, title: 'Longest Consecutive Sequence', difficulty: 'Medium', topic: 'Arrays & Hashing', pattern: 'HashSet Sequence', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/', notes: 'Check if number is start of sequence (n - 1 not in set).' },

    // Tier 7: Two Pointers & Sliding Window
    { id: 't7-1', sno: 7, title: 'Valid Palindrome', difficulty: 'Easy', topic: 'Two Pointers', pattern: 'Two Pointers', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/', notes: 'Two pointers converging from left and right skipping non-alphanumerics.' },
    { id: 't7-2', sno: 8, title: '3Sum', difficulty: 'Medium', topic: 'Two Pointers', pattern: 'Sorting + Two Pointers', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/3sum/', notes: 'Sort array and fix one number, then use two pointers for remaining sum.' },
    { id: 't7-3', sno: 9, title: 'Container With Most Water', difficulty: 'Medium', topic: 'Two Pointers', pattern: 'Greedy Two Pointers', solved: false, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/container-with-most-water/', notes: 'Move pointer pointing to the shorter line inward.' },
    { id: 't7-4', sno: 10, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', topic: 'Sliding Window', pattern: 'Single Pass Min Tracking', solved: true, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', notes: 'Track minimum price seen so far and calculate max profit.' },
    { id: 't7-5', sno: 11, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', topic: 'Sliding Window', pattern: 'Sliding Window + Set', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', notes: 'Expand right pointer, contract left when duplicate found.' },

    // Tier 8: Stack & Binary Search
    { id: 't8-1', sno: 12, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', pattern: 'Stack Matching', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/valid-parentheses/', notes: 'Push opening brackets onto stack and pop for matching closers.' },
    { id: 't8-2', sno: 13, title: 'Binary Search', difficulty: 'Easy', topic: 'Binary Search', pattern: 'Divide & Conquer', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/binary-search/', notes: 'Standard left <= right search space reduction.' },
    { id: 't8-3', sno: 14, title: 'Search in Rotated Sorted Array', difficulty: 'Medium', topic: 'Binary Search', pattern: 'Modified Binary Search', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', notes: 'Identify which half is sorted and check target range.' },

    // Tier 9: Linked List & Trees
    { id: 't9-1', sno: 15, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', pattern: 'Pointer Reversal', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/', notes: 'Keep prev, curr, and next pointers.' },
    { id: 't9-2', sno: 16, title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', pattern: 'Dummy Head Pointer', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/', notes: 'Iterative pointer traversal with dummy head.' },
    { id: 't9-3', sno: 17, title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Trees', pattern: 'Recursion / DFS', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/', notes: 'Swap left and right children recursively.' },
    { id: 't9-4', sno: 18, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Trees', pattern: 'DFS Tree Height', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', notes: '1 + max(depth(left), depth(right)).' },
    { id: 't9-5', sno: 19, title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Trees', pattern: 'Min/Max Bounds', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/', notes: 'Pass valid (min, max) range down recursive tree calls.' },

    // Tier 10: Graphs & Dynamic Programming
    { id: 't10-1', sno: 20, title: 'Number of Islands', difficulty: 'Medium', topic: 'Graphs', pattern: 'BFS / DFS Flood Fill', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/number-of-islands/', notes: 'Iterate grid, trigger DFS/BFS on unvisited land cells.' },
    { id: 't10-2', sno: 21, title: 'Course Schedule', difficulty: 'Medium', topic: 'Graphs', pattern: 'Topological Sort / DFS Cycle', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/course-schedule/', notes: 'Detect cycles in directed graph using 3-state DFS.' },
    { id: 't10-3', sno: 22, title: 'Climbing Stairs', difficulty: 'Easy', topic: 'Dynamic Programming', pattern: 'Fibonacci DP', solved: true, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/', notes: 'dp[i] = dp[i-1] + dp[i-2].' },
    { id: 't10-4', sno: 23, title: 'Coin Change', difficulty: 'Medium', topic: 'Dynamic Programming', pattern: 'Unbounded Knapsack', solved: false, bookmarked: true, leetcodeUrl: 'https://leetcode.com/problems/coin-change/', notes: 'Bottom-up DP table tracking minimum coins for each amount.' },
    { id: 't10-5', sno: 24, title: 'Longest Increasing Subsequence', difficulty: 'Medium', topic: 'Dynamic Programming', pattern: 'DP / Binary Search', solved: false, bookmarked: false, leetcodeUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/', notes: 'O(N log N) patience sorting with binary search.' }
  ]);

  const toggleSolved = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, solved: !q.solved } : q));
  };

  const toggleBookmark = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, bookmarked: !q.bookmarked } : q));
  };

  const togglePatternCollapse = (pattern) => {
    setCollapsedPatterns(prev => ({ ...prev, [pattern]: !prev[pattern] }));
  };

  const topics = ['All', 'Arrays & Hashing', 'Two Pointers', 'Sliding Window', 'Stack', 'Binary Search', 'Linked List', 'Trees', 'Graphs', 'Dynamic Programming', 'Heap / Priority Queue'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuestions = questions.filter(q => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'solved' ? q.solved :
      activeTab === 'todo' ? !q.solved :
      activeTab === 'bookmarked' ? q.bookmarked :
      hideSolved && q.solved ? false : true;

    if (hideSolved && q.solved && activeTab !== 'solved') return false;

    const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.pattern.toLowerCase().includes(searchQuery.toLowerCase()) || q.topic.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesTopic && matchesDiff && matchesSearch;
  });

  const totalCount = questions.length;
  const solvedCount = questions.filter(q => q.solved).length;
  const bookmarkedCount = questions.filter(q => q.bookmarked).length;

  // Group filtered questions by pattern for section headers matching index.html
  const groupedByPattern = filteredQuestions.reduce((acc, q) => {
    const pat = q.pattern || 'General';
    if (!acc[pat]) acc[pat] = [];
    acc[pat].push(q);
    return acc;
  }, {});

  return (
    <div className={`min-h-screen p-6 sm:p-10 transition-colors ${
      isDark ? 'bg-[#0c0e12] text-[#e6edf3]' : 'bg-[#f6f8fa] text-[#1f2328]'
    }`}>
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <header className="mb-6 pb-5 border-b border-[var(--border)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className={`p-2.5 rounded-xl border transition-colors flex items-center gap-2 text-xs font-semibold ${
                  isDark ? 'bg-[#141820] border-[#262e3d] text-[#8b949e] hover:text-white' : 'bg-white border-[#d0d7de] text-[#656d76] hover:text-black'
                }`}
                title="Return to Hub Login"
              >
                <ArrowLeft size={16} />
                <span>Hub Gateway</span>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">DSA Interview Question Tracker</h1>
                <p className="text-xs sm:text-sm opacity-70 mt-0.5">Exact replica of index.html interview tracker with pattern grouping, collapsible sections, and progress tracking.</p>
              </div>
            </div>

            {/* Mode Switcher Group & Stats */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                  isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
                }`}>
                  <span className="opacity-75">Solved:</span>
                  <strong className="text-[#3fb950] font-bold">{solvedCount} / {totalCount}</strong>
                </div>
                <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
                  isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
                }`}>
                  <span className="opacity-75">Saved:</span>
                  <strong className="text-[#d2a8ff] font-bold">{bookmarkedCount}</strong>
                </div>
              </div>

              <button
                onClick={() => navigate('/notes')}
                className="px-4 py-2 rounded-xl bg-[#58a6ff] hover:bg-[#4a90e2] text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <BookOpen size={14} />
                <span>Notie Study Hub</span>
              </button>
            </div>

          </div>
        </header>

        {/* Controls Bar: Tabs, Search, Filters, Hide Solved */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">

          {/* Tab Switcher */}
          <div className={`inline-flex p-1 rounded-xl border ${
            isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
          }`}>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'all' ? 'bg-[#58a6ff] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            >
              All Questions ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab('solved')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'solved' ? 'bg-[#58a6ff] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Solved ({solvedCount})
            </button>
            <button
              onClick={() => setActiveTab('todo')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'todo' ? 'bg-[#58a6ff] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            >
              To Do ({totalCount - solvedCount})
            </button>
            <button
              onClick={() => setActiveTab('bookmarked')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'bookmarked' ? 'bg-[#58a6ff] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
              }`}
            >
              Bookmarked ({bookmarkedCount})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="text"
                placeholder="Search problem title, pattern..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl border text-xs outline-none transition-colors ${
                  isDark ? 'bg-[#141820] border-[#262e3d] text-white focus:border-[#58a6ff]' : 'bg-white border-[#d0d7de] text-black focus:border-[#0969da]'
                }`}
              />
            </div>

            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs outline-none cursor-pointer ${
                isDark ? 'bg-[#141820] border-[#262e3d] text-white' : 'bg-white border-[#d0d7de] text-black'
              }`}
            >
              <option value="All">All Topics</option>
              {topics.filter(t => t !== 'All').map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className={`px-3 py-2 rounded-xl border text-xs outline-none cursor-pointer ${
                isDark ? 'bg-[#141820] border-[#262e3d] text-white' : 'bg-white border-[#d0d7de] text-black'
              }`}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <button
              onClick={() => setHideSolved(prev => !prev)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                hideSolved
                  ? 'bg-[#58a6ff] text-white border-[#58a6ff]'
                  : isDark ? 'bg-[#141820] border-[#262e3d] text-[#8b949e]' : 'bg-white border-[#d0d7de] text-[#656d76]'
              }`}
            >
              {hideSolved ? 'Showing Unsolved' : 'Hide Solved'}
            </button>
          </div>

        </div>

        {/* Main Questions Table grouped by Pattern (index.html exact style) */}
        <div className={`rounded-2xl border overflow-hidden shadow-md ${
          isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'border-[#262e3d] bg-[#1c2230] text-[#8b949e]' : 'border-[#d0d7de] bg-[#f3f4f6] text-[#656d76]'
                }`}>
                  <th className="p-3.5 w-14 text-center">#</th>
                  <th className="p-3.5 w-14 text-center">Done</th>
                  <th className="p-3.5">Problem Title</th>
                  <th className="p-3.5 w-28">Difficulty</th>
                  <th className="p-3.5 w-36">Topic</th>
                  <th className="p-3.5">Pattern & Strategy</th>
                  <th className="p-3.5 text-center w-20">Bookmark</th>
                  <th className="p-3.5 text-center w-28">LeetCode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit text-sm">
                {Object.keys(groupedByPattern).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center opacity-60">
                      No matching questions found in tracker.
                    </td>
                  </tr>
                ) : (
                  Object.entries(groupedByPattern).map(([patternName, patQuestions]) => {
                    const isCollapsed = collapsedPatterns[patternName];
                    const solvedInPat = patQuestions.filter(q => q.solved).length;

                    return (
                      <React.Fragment key={patternName}>
                        {/* Pattern Divider Row */}
                        <tr
                          onClick={() => togglePatternCollapse(patternName)}
                          className={`cursor-pointer select-none transition-colors ${
                            isDark ? 'bg-[#1c2230]/70 hover:bg-[#1c2230] border-t-2 border-[#262e3d]' : 'bg-[#f3f4f6] hover:bg-[#eaeef2] border-t-2 border-[#d0d7de]'
                          }`}
                        >
                          <td colSpan={8} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-xs transition-transform ${isCollapsed ? '-rotate-90' : ''}`}>▼</span>
                                <span className="font-display font-bold text-xs uppercase tracking-wider text-[#58a6ff]">
                                  {patternName}
                                </span>
                                <span className="text-xs opacity-60 font-mono">
                                  ({solvedInPat}/{patQuestions.length} solved)
                                </span>
                              </div>
                              <span className="text-[11px] opacity-50 font-mono">
                                {isCollapsed ? 'Click to expand' : 'Click to collapse'}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* Questions inside Pattern */}
                        {!isCollapsed && patQuestions.map(q => {
                          const diffColor =
                            q.difficulty === 'Easy' ? 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/30' :
                            q.difficulty === 'Medium' ? 'text-[#d29922] bg-[#d29922]/10 border-[#d29922]/30' :
                            'text-[#f85149] bg-[#f85149]/10 border-[#f85149]/30';

                          return (
                            <tr key={q.id} className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5 ${q.solved ? 'bg-[#3fb950]/5' : ''}`}>
                              <td className="p-3.5 text-center font-mono text-xs opacity-60">
                                {q.sno}
                              </td>

                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => toggleSolved(q.id)}
                                  className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors mx-auto ${
                                    q.solved
                                      ? 'bg-[#238636] border-[#238636] text-white'
                                      : isDark ? 'border-[#262e3d] bg-[#0c0e12]' : 'border-[#d0d7de] bg-[#f6f8fa]'
                                  }`}
                                  title={q.solved ? 'Mark as Unsolved' : 'Mark as Solved'}
                                >
                                  {q.solved && <CheckCircle2 size={14} />}
                                </button>
                              </td>

                              <td className="p-3.5 font-semibold font-display">
                                <span className={q.solved ? 'line-through opacity-70' : ''}>{q.title}</span>
                              </td>

                              <td className="p-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${diffColor}`}>
                                  {q.difficulty}
                                </span>
                              </td>

                              <td className="p-3.5 text-xs font-medium opacity-90">
                                {q.topic}
                              </td>

                              <td className="p-3.5 text-xs opacity-80">
                                <span className="inline-block px-2 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-mono text-[11px] mr-2">
                                  {q.pattern}
                                </span>
                                <span className="opacity-75">{q.notes}</span>
                              </td>

                              <td className="p-3.5 text-center">
                                <button
                                  onClick={() => toggleBookmark(q.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    q.bookmarked ? 'text-[#d2a8ff] bg-[#d2a8ff]/10' : 'opacity-40 hover:opacity-100'
                                  }`}
                                  title="Bookmark question"
                                >
                                  <Bookmark size={15} />
                                </button>
                              </td>

                              <td className="p-3.5 text-center">
                                <a
                                  href={q.leetcodeUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-[#58a6ff] hover:underline"
                                >
                                  <span>Solve</span>
                                  <ExternalLink size={12} />
                                </a>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
