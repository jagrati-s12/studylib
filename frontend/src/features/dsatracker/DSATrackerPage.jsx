import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import {
  Code2,
  CheckCircle2,
  Clock,
  Bookmark,
  ExternalLink,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DSATrackerPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'solved' | 'todo' | 'bookmarked'
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial DSA & Interview Questions dataset inspired by index.html
  const [questions, setQuestions] = useState([
    {
      id: 'dsa-1',
      title: 'Two Sum',
      difficulty: 'Easy',
      topic: 'Arrays & Hashing',
      pattern: 'Hash Map',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/two-sum/',
      notes: 'Use a hash map to store complements in O(N) time.'
    },
    {
      id: 'dsa-2',
      title: 'Valid Anagram',
      difficulty: 'Easy',
      topic: 'Arrays & Hashing',
      pattern: 'Frequency Counter',
      solved: true,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/valid-anagram/',
      notes: 'Count character frequencies using an array or hash map.'
    },
    {
      id: 'dsa-3',
      title: 'Group Anagrams',
      difficulty: 'Medium',
      topic: 'Arrays & Hashing',
      pattern: 'Hash Map',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/group-anagrams/',
      notes: 'Use sorted string or character count tuple as hash key.'
    },
    {
      id: 'dsa-4',
      title: 'Top K Frequent Elements',
      difficulty: 'Medium',
      topic: 'Heap / Priority Queue',
      pattern: 'Bucket Sort / Heap',
      solved: false,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/top-k-frequent-elements/',
      notes: 'Min-heap of size k or bucket sort for O(N).'
    },
    {
      id: 'dsa-5',
      title: 'Product of Array Except Self',
      difficulty: 'Medium',
      topic: 'Arrays & Hashing',
      pattern: 'Prefix / Suffix Products',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
      notes: 'Compute left and right running products without division operator.'
    },
    {
      id: 'dsa-6',
      title: 'Longest Consecutive Sequence',
      difficulty: 'Medium',
      topic: 'Arrays & Hashing',
      pattern: 'HashSet Sequence',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/',
      notes: 'Check if number is start of sequence (n - 1 not in set).'
    },
    {
      id: 'dsa-7',
      title: 'Valid Palindrome',
      difficulty: 'Easy',
      topic: 'Two Pointers',
      pattern: 'Two Pointers',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/valid-palindrome/',
      notes: 'Two pointers converging from left and right skipping non-alphanumerics.'
    },
    {
      id: 'dsa-8',
      title: '3Sum',
      difficulty: 'Medium',
      topic: 'Two Pointers',
      pattern: 'Sorting + Two Pointers',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/3sum/',
      notes: 'Sort array and fix one number, then use two pointers for remaining sum.'
    },
    {
      id: 'dsa-9',
      title: 'Merge Two Sorted Lists',
      difficulty: 'Easy',
      topic: 'Linked List',
      pattern: 'Dummy Head Pointer',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/merge-two-sorted-lists/',
      notes: 'Iterative pointer traversal with dummy head.'
    },
    {
      id: 'dsa-10',
      title: 'Reverse Linked List',
      difficulty: 'Easy',
      topic: 'Linked List',
      pattern: 'Pointer Reversal',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/reverse-linked-list/',
      notes: 'Keep prev, curr, and next pointers.'
    },
    {
      id: 'dsa-11',
      title: 'Binary Search',
      difficulty: 'Easy',
      topic: 'Binary Search',
      pattern: 'Divide & Conquer',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/binary-search/',
      notes: 'Standard left <= right search space reduction.'
    },
    {
      id: 'dsa-12',
      title: 'Search in Rotated Sorted Array',
      difficulty: 'Medium',
      topic: 'Binary Search',
      pattern: 'Modified Binary Search',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/search-in-rotated-sorted-array/',
      notes: 'Identify which half is sorted and check target range.'
    },
    {
      id: 'dsa-13',
      title: 'Invert Binary Tree',
      difficulty: 'Easy',
      topic: 'Trees',
      pattern: 'Recursion / DFS',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/invert-binary-tree/',
      notes: 'Swap left and right children recursively.'
    },
    {
      id: 'dsa-14',
      title: 'Validate Binary Search Tree',
      difficulty: 'Medium',
      topic: 'Trees',
      pattern: 'Min/Max Bounds',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
      notes: 'Pass valid (min, max) range down recursive tree calls.'
    },
    {
      id: 'dsa-15',
      title: 'Kth Smallest Element in a BST',
      difficulty: 'Medium',
      topic: 'Trees',
      pattern: 'In-order Traversal',
      solved: false,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
      notes: 'In-order traversal visits BST nodes in ascending order.'
    },
    {
      id: 'dsa-16',
      title: 'Course Schedule',
      difficulty: 'Medium',
      topic: 'Graphs',
      pattern: 'Topological Sort / DFS Cycle',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/course-schedule/',
      notes: 'Detect cycles in directed graph using 3-state DFS.'
    },
    {
      id: 'dsa-17',
      title: 'Climbing Stairs',
      difficulty: 'Easy',
      topic: 'Dynamic Programming',
      pattern: 'Fibonacci DP',
      solved: true,
      bookmarked: false,
      leetcodeUrl: 'https://leetcode.com/problems/climbing-stairs/',
      notes: 'dp[i] = dp[i-1] + dp[i-2].'
    },
    {
      id: 'dsa-18',
      title: 'Coin Change',
      difficulty: 'Medium',
      topic: 'Dynamic Programming',
      pattern: 'Unbounded Knapsack',
      solved: false,
      bookmarked: true,
      leetcodeUrl: 'https://leetcode.com/problems/coin-change/',
      notes: 'Bottom-up DP table tracking minimum coins for each amount.'
    }
  ]);

  const toggleSolved = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, solved: !q.solved } : q));
  };

  const toggleBookmark = (id) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, bookmarked: !q.bookmarked } : q));
  };

  const topics = ['All', 'Arrays & Hashing', 'Two Pointers', 'Linked List', 'Binary Search', 'Trees', 'Graphs', 'Dynamic Programming', 'Heap / Priority Queue'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

  const filteredQuestions = questions.filter(q => {
    const matchesTab =
      activeTab === 'all' ? true :
      activeTab === 'solved' ? q.solved :
      activeTab === 'todo' ? !q.solved :
      activeTab === 'bookmarked' ? q.bookmarked : true;

    const matchesTopic = selectedTopic === 'All' || q.topic === selectedTopic;
    const matchesDiff = selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || q.pattern.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesTopic && matchesDiff && matchesSearch;
  });

  const totalCount = questions.length;
  const solvedCount = questions.filter(q => q.solved).length;
  const bookmarkedCount = questions.filter(q => q.bookmarked).length;

  return (
    <div className={`min-h-screen p-8 transition-colors ${
      isDark ? 'bg-[#0c0e12] text-[#e6edf3]' : 'bg-[#f6f8fa] text-[#1f2328]'
    }`}>
      <div className="max-w-7xl mx-auto">

        {/* Top Header & Back to Login */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-inherit">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                isDark ? 'bg-[#141820] border-[#262e3d] text-[#8b949e] hover:text-white' : 'bg-white border-[#d0d7de] text-[#656d76] hover:text-black'
              }`}
            >
              <ArrowLeft size={16} />
              <span>Back to Hub Login</span>
            </button>
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight">DSA Interview Question Tracker</h1>
              <p className="text-xs opacity-70">Master NeetCode & Blind 75 algorithms with pattern filters & progress tracking.</p>
            </div>
          </div>

          {/* Stats Pills */}
          <div className="hidden sm:flex items-center gap-3">
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
              isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
            }`}>
              <span className="opacity-75">Solved:</span>
              <strong className="text-green-500 font-bold">{solvedCount} / {totalCount}</strong>
            </div>
            <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-2 ${
              isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
            }`}>
              <span className="opacity-75">Bookmarked:</span>
              <strong className="text-purple-400 font-bold">{bookmarkedCount}</strong>
            </div>
          </div>
        </div>

        {/* Mode & Tab Switcher Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/notes')}
              className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                isDark ? 'bg-[#141820] border-[#262e3d] text-[#58a6ff] hover:bg-[#1c2230]' : 'bg-white border-[#d0d7de] text-[#0969da] hover:bg-[#f3f4f6]'
              }`}
            >
              Switch to Notie Study Hub →
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50" />
            <input
              type="text"
              placeholder="Search problem title or pattern..."
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
        </div>

        {/* Questions Table / List */}
        <div className={`rounded-2xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-[#141820] border-[#262e3d]' : 'bg-white border-[#d0d7de]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={`border-b text-xs font-semibold uppercase tracking-wider ${
                  isDark ? 'border-[#262e3d] bg-[#1c2230] text-[#8b949e]' : 'border-[#d0d7de] bg-[#f3f4f6] text-[#656d76]'
                }`}>
                  <th className="p-4 w-12 text-center">Status</th>
                  <th className="p-4">Problem Title</th>
                  <th className="p-4">Difficulty</th>
                  <th className="p-4">Topic / Pattern</th>
                  <th className="p-4">Notes & Strategy</th>
                  <th className="p-4 text-center">Bookmark</th>
                  <th className="p-4 text-center">LeetCode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit text-sm">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center opacity-60">
                      No matching interview questions found. Try adjusting filters.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map(q => {
                    const diffColor =
                      q.difficulty === 'Easy' ? 'text-[#3fb950] bg-[#3fb950]/10 border-[#3fb950]/30' :
                      q.difficulty === 'Medium' ? 'text-[#d29922] bg-[#d29922]/10 border-[#d29922]/30' :
                      'text-[#f85149] bg-[#f85149]/10 border-[#f85149]/30';

                    return (
                      <tr key={q.id} className={`transition-colors hover:bg-black/5 dark:hover:bg-white/5`}>
                        <td className="p-4 text-center">
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

                        <td className="p-4 font-semibold font-display">
                          <span className={q.solved ? 'line-through opacity-70' : ''}>{q.title}</span>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${diffColor}`}>
                            {q.difficulty}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-medium text-xs">{q.topic}</div>
                          <div className="text-[11px] opacity-60 font-mono mt-0.5">{q.pattern}</div>
                        </td>

                        <td className="p-4 text-xs opacity-80 max-w-xs truncate">
                          {q.notes}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleBookmark(q.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              q.bookmarked ? 'text-purple-400 bg-purple-500/10' : 'opacity-40 hover:opacity-100'
                            }`}
                            title="Bookmark question"
                          >
                            <Bookmark size={16} />
                          </button>
                        </td>

                        <td className="p-4 text-center">
                          <a
                            href={q.leetcodeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#58a6ff] hover:underline"
                          >
                            <span>Open</span>
                            <ExternalLink size={12} />
                          </a>
                        </td>
                      </tr>
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
