import { useState, useMemo, useEffect } from "react";

/* ════════════════════════════════════════════════════════════════════
   PERSISTENCE — localStorage-backed state so progress survives
   page refreshes and browser restarts (per-device, client-side only)
   ════════════════════════════════════════════════════════════════════ */
const STORAGE_PREFIX = "sde3-tracker:";

function usePersistedState(key, initialValue) {
  const storageKey = STORAGE_PREFIX + key;
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      // localStorage unavailable (e.g. private browsing quota) — fail silently
    }
  }, [storageKey, value]);

  return [value, setValue];
}

/* ════════════════════════════════════════════════════════════════════
   TRACKS — top-level switcher: DSA / Java / LLD / System Design
   ════════════════════════════════════════════════════════════════════ */
const TRACKS = [
  { id: "dsa",    label: "DSA",            sub: "Data Structures & Algorithms" },
  { id: "java",   label: "Java",           sub: "Core + Concurrency + JVM" },
  { id: "lld",    label: "LLD",            sub: "Low-Level / OO Design" },
  { id: "hld",    label: "System Design",  sub: "High-Level Design" },
];

/* ════════════════════════════════════════════════════════════════════
   DSA TRACK
   ════════════════════════════════════════════════════════════════════ */
const DSA_TOPICS = [
  { id: "arrays",    label: "Arrays & Strings",        icon: "⊞" },
  { id: "linked",    label: "Linked Lists",             icon: "⬡" },
  { id: "stacks",    label: "Stacks & Queues",          icon: "≡" },
  { id: "trees",     label: "Trees & BST",              icon: "⌥" },
  { id: "heaps",     label: "Heaps & Priority Queue",   icon: "△" },
  { id: "tries",     label: "Tries",                    icon: "T" },
  { id: "graphs",    label: "Graphs",                   icon: "◎" },
  { id: "backtrack", label: "Backtracking",             icon: "↩" },
  { id: "dp",        label: "Dynamic Programming",      icon: "◈" },
  { id: "bits",      label: "Bit Manipulation",         icon: "&" },
  { id: "advanced",  label: "Advanced Data Structures", icon: "Σ" },
  { id: "greedy",    label: "Greedy Algorithms",        icon: "→" },
];

// slug map so LeetCode links actually resolve (not just /problems/<number>)
const LC_SLUGS = {
  1:"two-sum",11:"container-with-most-water",42:"trapping-rain-water",
  76:"minimum-window-substring",3:"longest-substring-without-repeating-characters",
  239:"sliding-window-maximum",33:"search-in-rotated-sorted-array",
  153:"find-minimum-in-rotated-sorted-array",4:"median-of-two-sorted-arrays",
  56:"merge-intervals",238:"product-of-array-except-self",
  560:"subarray-sum-equals-k",152:"maximum-product-subarray",
  31:"next-permutation",128:"longest-consecutive-sequence",
  84:"largest-rectangle-in-histogram",315:"count-of-smaller-numbers-after-self",
  5:"longest-palindromic-substring",
  206:"reverse-linked-list",876:"middle-of-the-linked-list",
  160:"intersection-of-two-linked-lists",234:"palindrome-linked-list",
  142:"linked-list-cycle-ii",19:"remove-nth-node-from-end-of-list",
  25:"reverse-nodes-in-k-group",23:"merge-k-sorted-lists",
  146:"lru-cache",138:"copy-list-with-random-pointer",
  430:"flatten-a-multilevel-doubly-linked-list",148:"sort-list",
  20:"valid-parentheses",155:"min-stack",232:"implement-queue-using-stacks",
  394:"decode-string",224:"basic-calculator",739:"daily-temperatures",
  402:"remove-k-digits",735:"asteroid-collision",895:"maximum-frequency-stack",
  102:"binary-tree-level-order-traversal",199:"binary-tree-right-side-view",
  987:"vertical-order-traversal-of-a-binary-tree",103:"binary-tree-zigzag-level-order-traversal",
  104:"maximum-depth-of-binary-tree",124:"binary-tree-maximum-path-sum",
  236:"lowest-common-ancestor-of-a-binary-tree",114:"flatten-binary-tree-to-linked-list",
  297:"serialize-and-deserialize-binary-tree",105:"construct-binary-tree-from-preorder-and-inorder-traversal",
  98:"validate-binary-search-tree",99:"recover-binary-search-tree",
  230:"kth-smallest-element-in-a-bst",173:"binary-search-tree-iterator",
  222:"count-complete-tree-nodes",307:"range-sum-query-mutable",
  308:"range-sum-query-2d-mutable",
  215:"kth-largest-element-in-an-array",347:"top-k-frequent-elements",
  973:"k-closest-points-to-origin",373:"find-k-pairs-with-smallest-sums",
  378:"kth-smallest-element-in-a-sorted-matrix",295:"find-median-from-data-stream",
  480:"sliding-window-median",502:"ipo",621:"task-scheduler",
  253:"meeting-rooms-ii",767:"reorganize-string",632:"smallest-range-covering-elements-from-k-lists",
  208:"implement-trie-prefix-tree",211:"design-add-and-search-words-data-structure",
  648:"replace-words",720:"longest-word-in-dictionary",
  1268:"search-suggestions-system",421:"maximum-xor-of-two-numbers-in-an-array",
  212:"word-search-ii",336:"palindrome-pairs",1032:"stream-of-characters",
  200:"number-of-islands",133:"clone-graph",417:"pacific-atlantic-water-flow",
  547:"number-of-provinces",286:"walls-and-gates",994:"rotting-oranges",
  207:"course-schedule",210:"course-schedule-ii",269:"alien-dictionary",
  444:"sequence-reconstruction",743:"network-delay-time",
  787:"cheapest-flights-within-k-stops",127:"word-ladder",
  778:"swim-in-rising-water",1631:"path-with-minimum-effort",
  1192:"critical-connections-in-a-network",1101:"find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree",
  1584:"min-cost-to-connect-all-points",721:"accounts-merge",
  1091:"shortest-path-in-binary-matrix",815:"bus-routes",
  1345:"jump-game-iv",1547:"minimum-cost-to-cut-a-stick",
  78:"subsets",77:"combinations",39:"combination-sum",
  17:"letter-combinations-of-a-phone-number",46:"permutations",
  51:"n-queens",37:"sudoku-solver",79:"word-search",
  980:"unique-paths-iii",131:"palindrome-partitioning",
  93:"restore-ip-addresses",282:"expression-add-operators",
  22:"generate-parentheses",
  70:"climbing-stairs",198:"house-robber",45:"jump-game-ii",
  91:"decode-ways",53:"maximum-subarray",300:"longest-increasing-subsequence",
  1143:"longest-common-subsequence",72:"edit-distance",115:"distinct-subsequences",
  516:"longest-palindromic-subsequence",416:"partition-equal-subset-sum",
  518:"coin-change-2",494:"target-sum",312:"burst-balloons",
  132:"palindrome-partitioning-ii",1000:"minimum-cost-to-merge-stones",
  664:"strange-printer",10:"regular-expression-matching",
  139:"word-break",97:"interleaving-string",62:"unique-paths",
  64:"minimum-path-sum",174:"dungeon-game",337:"house-robber-iii",
  968:"binary-tree-cameras",847:"shortest-path-visiting-all-nodes",
  691:"stickers-to-spell-word",
  136:"single-number",137:"single-number-ii",260:"single-number-iii",
  191:"number-of-1-bits",338:"counting-bits",190:"reverse-bits",
  231:"power-of-two",477:"total-hamming-distance",898:"bitwise-ors-of-subarrays",
  1879:"minimum-xor-sum-of-two-arrays",1178:"number-of-valid-words-for-each-puzzle",
  371:"sum-of-two-integers",29:"divide-two-integers",
  201:"bitwise-and-of-numbers-range",393:"utf-8-validation",
  684:"redundant-connection",305:"number-of-islands-ii",
  765:"minimum-number-of-swaps-to-make-the-string-balanced",
  218:"the-skyline-problem",327:"count-of-range-sum",
  493:"reverse-pairs",850:"rectangle-area-ii",
  907:"sum-of-subarray-minimums",962:"maximum-width-ramp",
  1696:"jump-game-vi",460:"lfu-cache",381:"insert-delete-getrandom-o1-duplicates-allowed",
  1044:"longest-duplicate-substring",214:"shortest-palindrome",
  727:"minimum-window-subsequence",
  435:"non-overlapping-intervals",452:"minimum-number-of-arrows-to-burst-balloons",
  1094:"car-pooling",1024:"video-stitching",55:"jump-game",
  134:"gas-station",135:"candy",881:"boats-to-save-people",
  763:"partition-labels",316:"remove-duplicate-letters",
  1167:"minimum-cost-to-connect-sticks",376:"wiggle-subsequence",
  179:"largest-number",991:"broken-calculator",
};

const DSA_DATA = {
  arrays: [
    { g: "Two pointers & sliding window" },
    { lc: 1,    title: "Two sum / k-sum variants",                          diff: "medium", tags: ["hash map","two pointers"] },
    { lc: 11,   title: "Container with most water",                         diff: "medium", tags: ["two pointers","greedy"] },
    { lc: 42,   title: "Trapping rain water",                               diff: "hard",   tags: ["two pointers","stack"] },
    { lc: 76,   title: "Minimum window substring",                          diff: "hard",   tags: ["sliding window","hash map"] },
    { lc: 3,    title: "Longest substring without repeating characters",    diff: "medium", tags: ["sliding window"] },
    { lc: 239,  title: "Sliding window maximum",                            diff: "hard",   tags: ["deque","sliding window"] },
    { g: "Sorting & searching" },
    { lc: 33,   title: "Search in rotated sorted array",                    diff: "medium", tags: ["binary search"] },
    { lc: 153,  title: "Find minimum in rotated sorted array",              diff: "medium", tags: ["binary search"] },
    { lc: 4,    title: "Median of two sorted arrays",                       diff: "hard",   tags: ["binary search"] },
    { lc: 56,   title: "Merge intervals / insert interval",                 diff: "medium", tags: ["sorting","intervals"] },
    { g: "Prefix / in-place" },
    { lc: 238,  title: "Product of array except self",                      diff: "medium", tags: ["prefix product"] },
    { lc: 560,  title: "Subarray sum equals k",                             diff: "medium", tags: ["prefix sum","hash map"] },
    { lc: 152,  title: "Maximum product subarray",                          diff: "medium", tags: ["dp","prefix/suffix"] },
    { lc: 31,   title: "Next permutation",                                  diff: "medium", tags: ["in-place","greedy"] },
    { lc: 128,  title: "Longest consecutive sequence",                      diff: "medium", tags: ["hash set"] },
    { g: "Hard / advanced" },
    { lc: 84,   title: "Largest rectangle in histogram",                    diff: "hard",   tags: ["monotonic stack"] },
    { lc: 315,  title: "Count of smaller numbers after self",               diff: "hard",   tags: ["merge sort","BIT"] },
    { lc: 5,    title: "Longest palindromic substring",                     diff: "medium", tags: ["expand around center","dp"] },
  ],
  linked: [
    { g: "Fundamentals" },
    { lc: 206,  title: "Reverse a linked list (iterative & recursive)",     diff: "easy",   tags: ["pointers"] },
    { lc: 876,  title: "Find the middle of a linked list",                  diff: "easy",   tags: ["slow/fast pointers"] },
    { lc: 160,  title: "Intersection of two linked lists",                  diff: "easy",   tags: ["two pointers"] },
    { lc: 234,  title: "Palindrome linked list",                            diff: "easy",   tags: ["reverse","slow/fast"] },
    { g: "Cycle & reordering" },
    { lc: 142,  title: "Detect cycle and find cycle start (Floyd's)",       diff: "medium", tags: ["slow/fast pointers"] },
    { lc: 19,   title: "Remove nth node from end",                          diff: "medium", tags: ["two pointers"] },
    { lc: 25,   title: "Reverse nodes in k-groups",                         diff: "hard",   tags: ["recursion","pointers"] },
    { g: "Advanced" },
    { lc: 23,   title: "Merge k sorted lists",                              diff: "hard",   tags: ["min-heap","divide & conquer"] },
    { lc: 146,  title: "LRU cache",                                         diff: "medium", tags: ["doubly linked list","hash map"] },
    { lc: 138,  title: "Copy list with random pointer",                     diff: "medium", tags: ["hash map","interleaving"] },
    { lc: 430,  title: "Flatten a multilevel doubly linked list",           diff: "medium", tags: ["DFS","pointers"] },
    { lc: 148,  title: "Sort list (merge sort on list)",                    diff: "medium", tags: ["merge sort","slow/fast"] },
  ],
  stacks: [
    { g: "Classic stack" },
    { lc: 20,   title: "Valid parentheses / minimum add to make valid",     diff: "easy",   tags: ["stack"] },
    { lc: 155,  title: "Min stack (O(1) getMin)",                           diff: "easy",   tags: ["stack design"] },
    { lc: 232,  title: "Implement queue using two stacks",                  diff: "easy",   tags: ["stack","amortized O(1)"] },
    { lc: 394,  title: "Decode string (e.g. 3[a2[bc]])",                   diff: "medium", tags: ["stack","recursion"] },
    { lc: 224,  title: "Basic calculator I & II",                           diff: "hard",   tags: ["stack","parsing"] },
    { g: "Monotonic stack" },
    { lc: 739,  title: "Daily temperatures (next greater element)",         diff: "medium", tags: ["monotonic stack"] },
    { lc: 84,   title: "Largest rectangle in histogram",                    diff: "hard",   tags: ["monotonic stack"] },
    { lc: 402,  title: "Remove k digits to get smallest number",            diff: "medium", tags: ["greedy","monotonic stack"] },
    { lc: 735,  title: "Asteroid collision",                                diff: "medium", tags: ["stack","simulation"] },
    { lc: 42,   title: "Trapping rain water (stack approach)",              diff: "hard",   tags: ["stack","two pointers"] },
    { g: "Deque / design" },
    { lc: 239,  title: "Sliding window maximum",                            diff: "hard",   tags: ["monotonic deque"] },
    { lc: 895,  title: "Maximum frequency stack (FreqStack)",               diff: "hard",   tags: ["stack design","hash map"] },
  ],
  trees: [
    { g: "Traversals" },
    { lc: 102,  title: "Binary tree level-order traversal (BFS)",           diff: "medium", tags: ["BFS","queue"] },
    { lc: 199,  title: "Right side view of binary tree",                    diff: "medium", tags: ["BFS","DFS"] },
    { lc: 987,  title: "Vertical order traversal of binary tree",           diff: "hard",   tags: ["BFS","coordinate sort"] },
    { lc: 103,  title: "Binary tree zigzag level order traversal",          diff: "medium", tags: ["BFS","deque"] },
    { g: "Path & structure" },
    { lc: 104,  title: "Maximum depth / diameter of binary tree",           diff: "easy",   tags: ["DFS","recursion"] },
    { lc: 124,  title: "Binary tree maximum path sum",                      diff: "hard",   tags: ["DFS","post-order"] },
    { lc: 236,  title: "Lowest common ancestor (LCA) of BST / BT",         diff: "medium", tags: ["DFS","recursion"] },
    { lc: 114,  title: "Flatten binary tree to linked list",                diff: "medium", tags: ["Morris traversal","DFS"] },
    { g: "Construction & validation" },
    { lc: 297,  title: "Serialize and deserialize binary tree",             diff: "hard",   tags: ["BFS/DFS","design"] },
    { lc: 105,  title: "Construct BT from preorder & inorder traversal",    diff: "medium", tags: ["recursion","hash map"] },
    { lc: 98,   title: "Validate binary search tree",                       diff: "medium", tags: ["in-order","bounds"] },
    { lc: 99,   title: "Recover BST (two nodes swapped)",                   diff: "hard",   tags: ["Morris in-order"] },
    { g: "BST operations" },
    { lc: 230,  title: "Kth smallest element in BST",                       diff: "medium", tags: ["in-order","augmented BST"] },
    { lc: 173,  title: "BST iterator (in-order, O(h) space)",               diff: "medium", tags: ["stack","iterator design"] },
    { lc: 222,  title: "Count complete tree nodes (O(log²n))",              diff: "medium", tags: ["binary search","bit tricks"] },
    { g: "Advanced structures" },
    { lc: 307,  title: "Segment tree — range sum query & update",           diff: "hard",   tags: ["segment tree","design"] },
    { lc: 308,  title: "Binary indexed tree (Fenwick) — point update",      diff: "hard",   tags: ["BIT","design"] },
  ],
  heaps: [
    { g: "Top-K patterns" },
    { lc: 215,  title: "Kth largest element in an array",                   diff: "medium", tags: ["min-heap","quickselect"] },
    { lc: 347,  title: "Top k frequent elements",                           diff: "medium", tags: ["max-heap","bucket sort"] },
    { lc: 973,  title: "K closest points to origin",                        diff: "medium", tags: ["max-heap"] },
    { lc: 373,  title: "Find k pairs with smallest sums",                   diff: "medium", tags: ["min-heap"] },
    { lc: 378,  title: "Kth smallest in a sorted matrix",                   diff: "medium", tags: ["min-heap","binary search"] },
    { g: "Stream & merge" },
    { lc: 23,   title: "Merge k sorted lists",                              diff: "hard",   tags: ["min-heap","divide & conquer"] },
    { lc: 295,  title: "Find median from data stream",                      diff: "hard",   tags: ["two heaps"] },
    { lc: 480,  title: "Sliding window median",                             diff: "hard",   tags: ["two heaps","lazy deletion"] },
    { lc: 502,  title: "IPO — maximize capital (greedy + heap)",            diff: "hard",   tags: ["two heaps","greedy"] },
    { g: "Scheduling & simulation" },
    { lc: 621,  title: "Task scheduler (CPU scheduling)",                   diff: "medium", tags: ["max-heap","greedy"] },
    { lc: 253,  title: "Meeting rooms II (min rooms needed)",               diff: "medium", tags: ["min-heap","sorting"] },
    { lc: 767,  title: "Reorganize string (no adjacent same chars)",        diff: "medium", tags: ["max-heap","greedy"] },
    { lc: 632,  title: "Smallest range covering k lists",                   diff: "hard",   tags: ["min-heap","sliding window"] },
  ],
  tries: [
    { g: "Core trie operations" },
    { lc: 208,  title: "Implement trie (insert, search, startsWith)",       diff: "medium", tags: ["trie design"] },
    { lc: 211,  title: "Design add and search words data structure",        diff: "medium", tags: ["trie","DFS","wildcard"] },
    { lc: 648,  title: "Replace words with shortest root in sentence",      diff: "medium", tags: ["trie","prefix"] },
    { g: "Prefix & autocomplete" },
    { lc: 720,  title: "Longest word in dictionary built one char at a time", diff: "medium", tags: ["trie","BFS"] },
    { lc: 1268, title: "Search suggestions system (autocomplete)",          diff: "medium", tags: ["trie","sorting"] },
    { lc: 421,  title: "Maximum XOR of two numbers (XOR trie)",             diff: "medium", tags: ["binary trie","bit manipulation"] },
    { g: "Hard trie problems" },
    { lc: 212,  title: "Word search II (board + trie)",                     diff: "hard",   tags: ["trie","backtracking","DFS"] },
    { lc: 336,  title: "Palindrome pairs using trie",                       diff: "hard",   tags: ["trie","string","palindrome check"] },
    { lc: 1032, title: "Stream of characters — find any word from list",    diff: "hard",   tags: ["suffix trie","sliding window"] },
  ],
  graphs: [
    { g: "BFS / DFS traversal" },
    { lc: 200,  title: "Number of islands / connected components",          diff: "medium", tags: ["DFS/BFS","union-find"] },
    { lc: 133,  title: "Clone graph",                                       diff: "medium", tags: ["BFS","hash map"] },
    { lc: 417,  title: "Pacific Atlantic water flow",                       diff: "medium", tags: ["multi-source BFS/DFS"] },
    { lc: 547,  title: "Number of provinces (undirected)",                  diff: "medium", tags: ["DFS","union-find"] },
    { lc: 286,  title: "Walls and gates (multi-source BFS)",                diff: "medium", tags: ["BFS"] },
    { lc: 994,  title: "Rotting oranges",                                   diff: "medium", tags: ["multi-source BFS"] },
    { g: "Topological sort" },
    { lc: 207,  title: "Course schedule I — detect cycle",                  diff: "medium", tags: ["Kahn's","DFS cycle"] },
    { lc: 210,  title: "Course schedule II — ordering",                     diff: "medium", tags: ["topological sort"] },
    { lc: 269,  title: "Alien dictionary (topo sort on chars)",             diff: "hard",   tags: ["topo sort","graph build"] },
    { lc: 444,  title: "Sequence reconstruction (unique topo order)",       diff: "medium", tags: ["topological sort"] },
    { g: "Shortest path" },
    { lc: 743,  title: "Dijkstra's — network delay time",                   diff: "medium", tags: ["min-heap","greedy"] },
    { lc: 787,  title: "Cheapest flights within k stops (Bellman-Ford)",    diff: "medium", tags: ["Bellman-Ford","DP"] },
    { lc: 127,  title: "Word ladder — shortest transformation sequence",    diff: "hard",   tags: ["BFS","bidirectional BFS"] },
    { lc: 778,  title: "Swim in rising water / path with min effort",       diff: "hard",   tags: ["Dijkstra","binary search+BFS"] },
    { lc: 1631, title: "Path with minimum maximum value",                   diff: "medium", tags: ["binary search","Dijkstra"] },
    { g: "Advanced graph algorithms" },
    { lc: 1192, title: "Critical connections in a network (bridges)",       diff: "hard",   tags: ["Tarjan's","DFS"] },
    { lc: 1101, title: "Strongly connected components (Kosaraju's)",        diff: "hard",   tags: ["two-pass DFS"] },
    { lc: 1584, title: "Minimum spanning tree (Prim's / Kruskal's)",        diff: "medium", tags: ["MST","union-find"] },
    { lc: 721,  title: "Accounts merge / union-find with path compression", diff: "medium", tags: ["union-find","DFS"] },
    { g: "Grid & state-space BFS" },
    { lc: 1091, title: "Shortest path in binary matrix",                    diff: "medium", tags: ["BFS"] },
    { lc: 815,  title: "Bus routes (min buses to reach stop)",              diff: "hard",   tags: ["BFS","set"] },
    { lc: 1345, title: "Jump game III / IV — min jumps",                    diff: "medium", tags: ["BFS","graph modeling"] },
    { lc: 1547, title: "Minimum cost to cut a stick (interval)",            diff: "hard",   tags: ["interval DP","graph"] },
  ],
  backtrack: [
    { g: "Subsets & combinations" },
    { lc: 78,   title: "Subsets I & II (with/without duplicates)",          diff: "medium", tags: ["backtracking","bit mask"] },
    { lc: 77,   title: "Combinations (choose k from n)",                    diff: "medium", tags: ["backtracking"] },
    { lc: 39,   title: "Combination sum I & II",                            diff: "medium", tags: ["backtracking","pruning"] },
    { lc: 17,   title: "Letter combinations of a phone number",             diff: "medium", tags: ["backtracking"] },
    { g: "Permutations" },
    { lc: 46,   title: "Permutations I & II (with duplicates)",             diff: "medium", tags: ["backtracking","swap"] },
    { lc: 31,   title: "Next permutation (iterative)",                      diff: "medium", tags: ["greedy","in-place"] },
    { g: "Grid & constraint problems" },
    { lc: 51,   title: "N-queens",                                          diff: "hard",   tags: ["backtracking","constraint"] },
    { lc: 37,   title: "Sudoku solver",                                     diff: "hard",   tags: ["backtracking","constraint propagation"] },
    { lc: 79,   title: "Word search I & II on board",                       diff: "medium", tags: ["backtracking","DFS"] },
    { lc: 980,  title: "Unique paths III (obstacle grid)",                  diff: "hard",   tags: ["backtracking","DFS"] },
    { g: "Partitioning & expression" },
    { lc: 131,  title: "Palindrome partitioning I (all partitions)",        diff: "medium", tags: ["backtracking","dp check"] },
    { lc: 93,   title: "Restore IP addresses",                              diff: "medium", tags: ["backtracking","string"] },
    { lc: 282,  title: "Expression add operators (insert +,-,*)",           diff: "hard",   tags: ["backtracking","math"] },
    { lc: 22,   title: "Generate parentheses",                              diff: "medium", tags: ["backtracking","counting"] },
  ],
  dp: [
    { g: "1D DP" },
    { lc: 70,   title: "Climbing stairs / coin change (min coins)",         diff: "easy",   tags: ["1D dp"] },
    { lc: 198,  title: "House robber I & II (circular)",                    diff: "medium", tags: ["1D dp"] },
    { lc: 45,   title: "Jump game II — min jumps",                          diff: "medium", tags: ["greedy","1D dp"] },
    { lc: 91,   title: "Decode ways (how many decodings)",                  diff: "medium", tags: ["1D dp"] },
    { lc: 53,   title: "Maximum sum subarray (Kadane's)",                   diff: "easy",   tags: ["Kadane's"] },
    { g: "Subsequence DP" },
    { lc: 300,  title: "Longest increasing subsequence (O(n log n))",       diff: "medium", tags: ["binary search","patience sort"] },
    { lc: 1143, title: "Longest common subsequence",                        diff: "medium", tags: ["2D dp"] },
    { lc: 72,   title: "Edit distance (Levenshtein)",                       diff: "hard",   tags: ["2D dp"] },
    { lc: 115,  title: "Distinct subsequences",                             diff: "hard",   tags: ["2D dp"] },
    { lc: 516,  title: "Longest palindromic subsequence",                   diff: "medium", tags: ["2D dp"] },
    { g: "Knapsack & partition" },
    { lc: 416,  title: "0/1 knapsack — partition equal subset sum",         diff: "medium", tags: ["dp","space optimization"] },
    { lc: 518,  title: "Coin change II — count ways",                       diff: "medium", tags: ["unbounded knapsack"] },
    { lc: 494,  title: "Target sum (assign +/-)",                           diff: "medium", tags: ["subset sum","dp"] },
    { g: "Interval DP" },
    { lc: 312,  title: "Burst balloons",                                    diff: "hard",   tags: ["interval dp"] },
    { lc: 132,  title: "Palindrome partitioning II (min cuts)",             diff: "hard",   tags: ["interval dp","prefix dp"] },
    { lc: 1000, title: "Minimum cost to merge stones",                      diff: "hard",   tags: ["interval dp"] },
    { lc: 664,  title: "Strange printer",                                   diff: "hard",   tags: ["interval dp"] },
    { g: "String DP" },
    { lc: 10,   title: "Regular expression matching",                       diff: "hard",   tags: ["2D dp","recursion+memo"] },
    { lc: 139,  title: "Word break I & II",                                 diff: "medium", tags: ["dp","backtracking"] },
    { lc: 97,   title: "Interleaving string",                               diff: "medium", tags: ["2D dp"] },
    { g: "Grid & path DP" },
    { lc: 62,   title: "Unique paths I & II (with obstacles)",              diff: "medium", tags: ["2D dp"] },
    { lc: 64,   title: "Minimum path sum in grid",                          diff: "medium", tags: ["2D dp"] },
    { lc: 174,  title: "Dungeon game (min HP to reach princess)",           diff: "hard",   tags: ["reverse dp"] },
    { g: "Tree & state DP" },
    { lc: 337,  title: "House robber III (on binary tree)",                diff: "medium", tags: ["tree dp"] },
    { lc: 968,  title: "Binary tree cameras (min cameras to cover)",        diff: "hard",   tags: ["tree dp","greedy"] },
    { g: "Bitmask DP" },
    { lc: 847,  title: "Shortest path visiting all nodes (TSP-lite)",       diff: "hard",   tags: ["bitmask dp","BFS"] },
    { lc: 691,  title: "Stickers to spell word",                            diff: "hard",   tags: ["bitmask dp","memoization"] },
  ],
  bits: [
    { g: "Bit tricks & fundamentals" },
    { lc: 136,  title: "Single number I — find non-duplicate (XOR)",        diff: "easy",   tags: ["XOR"] },
    { lc: 137,  title: "Single number II — appears once (others 3×)",       diff: "medium", tags: ["bit counting","state machine"] },
    { lc: 260,  title: "Single number III — two non-duplicates",            diff: "medium", tags: ["XOR","grouping"] },
    { lc: 191,  title: "Number of 1 bits (Hamming weight)",                 diff: "easy",   tags: ["bit trick","Brian Kernighan"] },
    { lc: 338,  title: "Counting bits — popcount for 0…n",                  diff: "easy",   tags: ["dp","bit trick"] },
    { lc: 190,  title: "Reverse bits of a 32-bit integer",                  diff: "easy",   tags: ["bit manipulation"] },
    { lc: 231,  title: "Power of two / three / four (bit check)",           diff: "easy",   tags: ["bit check"] },
    { g: "Bitmasking & subsets" },
    { lc: 78,   title: "Subsets using bitmask enumeration",                 diff: "medium", tags: ["bitmask","enumeration"] },
    { lc: 421,  title: "Maximum XOR of two numbers in array (trie)",        diff: "medium", tags: ["XOR trie","prefix"] },
    { lc: 477,  title: "Total Hamming distance between all pairs",          diff: "medium", tags: ["bit counting","math"] },
    { lc: 898,  title: "Bitwise ORs of subarrays",                          diff: "medium", tags: ["bits","set"] },
    { g: "Bit DP & advanced" },
    { lc: 847,  title: "Shortest path visiting all nodes (bitmask DP)",     diff: "hard",   tags: ["bitmask dp","BFS"] },
    { lc: 1879, title: "Minimum XOR sum of two arrays (bitmask DP)",        diff: "hard",   tags: ["bitmask dp","assignment"] },
    { lc: 1178, title: "Number of valid words for each puzzle",             diff: "hard",   tags: ["bitmask","trie"] },
    { g: "Arithmetic via bits" },
    { lc: 371,  title: "Add two integers without + operator",               diff: "medium", tags: ["carry simulation"] },
    { lc: 29,   title: "Divide two integers without division/multiplication",diff: "medium", tags: ["bit shifting"] },
    { lc: 201,  title: "Bitwise AND of numbers range [left, right]",        diff: "medium", tags: ["common prefix"] },
    { lc: 393,  title: "UTF-8 validation",                                  diff: "medium", tags: ["bit parsing"] },
  ],
  advanced: [
    { g: "Union-Find (Disjoint Set Union)" },
    { lc: 684,  title: "Implement union-find with path compression + rank", diff: "medium", tags: ["DSU","design"] },
    { lc: 305,  title: "Number of islands II (online queries)",             diff: "hard",   tags: ["DSU","online"] },
    { lc: 685,  title: "Redundant connection / cycle in undirected graph",  diff: "medium", tags: ["DSU"] },
    { lc: 765,  title: "Minimum number of swaps to sort array",             diff: "hard",   tags: ["DSU","cycle detection"] },
    { g: "Segment Tree & BIT" },
    { lc: 307,  title: "Range sum query — mutable (segment tree / BIT)",    diff: "medium", tags: ["segment tree","BIT"] },
    { lc: 218,  title: "The skyline problem (segment tree / sorted map)",   diff: "hard",   tags: ["segment tree","sweep line"] },
    { lc: 327,  title: "Count of range sum (merge sort / BIT)",             diff: "hard",   tags: ["BIT","merge sort"] },
    { lc: 493,  title: "Reverse pairs (merge sort / BIT)",                  diff: "hard",   tags: ["BIT","merge sort"] },
    { lc: 850,  title: "Rectangle area II — union of rectangles",           diff: "hard",   tags: ["coordinate compress","segment tree"] },
    { g: "Monotonic structures" },
    { lc: 907,  title: "Sum of subarray minimums (monotonic stack + prefix)",diff: "medium", tags: ["monotonic stack","contribution"] },
    { lc: 962,  title: "Maximum width ramp",                                diff: "medium", tags: ["monotonic stack"] },
    { lc: 1696, title: "Jump game VI — max score (deque DP)",               diff: "medium", tags: ["monotonic deque","dp"] },
    { g: "Cache & hash design" },
    { lc: 460,  title: "LFU cache (least frequently used)",                 diff: "hard",   tags: ["doubly linked list","hash map"] },
    { lc: 381,  title: "Insert delete getRandom O(1) — with duplicates",    diff: "hard",   tags: ["hash map","array"] },
    { g: "Suffix array & string structures" },
    { lc: 1044, title: "Longest duplicate substring (binary search + rolling hash)", diff: "hard", tags: ["rolling hash","binary search"] },
    { lc: 214,  title: "Shortest palindrome (KMP failure function)",        diff: "hard",   tags: ["KMP","string hashing"] },
    { lc: 727,  title: "Minimum window subsequence",                        diff: "hard",   tags: ["two pointers","dp"] },
  ],
  greedy: [
    { g: "Interval scheduling" },
    { lc: 435,  title: "Non-overlapping intervals (min removals)",          diff: "medium", tags: ["greedy","sorting"] },
    { lc: 253,  title: "Meeting rooms II — min rooms",                      diff: "medium", tags: ["greedy","min-heap"] },
    { lc: 452,  title: "Minimum number of arrows to burst balloons",        diff: "medium", tags: ["greedy","intervals"] },
    { lc: 1094, title: "Car pooling (capacity check)",                      diff: "medium", tags: ["greedy","difference array"] },
    { lc: 1024, title: "Video stitching — min clips to cover range",        diff: "medium", tags: ["greedy","intervals"] },
    { g: "Jump & array greedy" },
    { lc: 55,   title: "Jump game I — can reach end?",                      diff: "medium", tags: ["greedy"] },
    { lc: 45,   title: "Jump game II — min jumps to end",                   diff: "medium", tags: ["greedy","BFS"] },
    { lc: 134,  title: "Gas station — circular tour",                       diff: "medium", tags: ["greedy"] },
    { lc: 135,  title: "Candy — minimum candy distribution",               diff: "hard",   tags: ["greedy","two-pass"] },
    { lc: 881,  title: "Boats to save people (fewest boats)",               diff: "medium", tags: ["greedy","two pointers"] },
    { g: "String & sequence greedy" },
    { lc: 763,  title: "Partition labels — fewest partitions",              diff: "medium", tags: ["greedy","last occurrence"] },
    { lc: 767,  title: "Reorganize string (no two adjacent same)",          diff: "medium", tags: ["greedy","max-heap"] },
    { lc: 316,  title: "Remove duplicate letters — lexicographically smallest", diff: "medium", tags: ["greedy","monotonic stack"] },
    { lc: 621,  title: "Minimum number of CPU tasks",                       diff: "medium", tags: ["greedy","sorting"] },
    { g: "Optimization & exchange argument" },
    { lc: 1167, title: "Minimum cost to connect ropes (Huffman)",           diff: "medium", tags: ["greedy","min-heap"] },
    { lc: 376,  title: "Wiggle subsequence — max length alternating diff",  diff: "medium", tags: ["greedy","dp"] },
    { lc: 179,  title: "Largest number (arrange to form biggest)",          diff: "medium", tags: ["greedy","custom sort"] },
    { lc: 502,  title: "IPO — maximize capital before k projects",          diff: "hard",   tags: ["greedy","two heaps"] },
    { lc: 991,  title: "Broken calculator — reach target with min ops",     diff: "medium", tags: ["greedy","reverse thinking"] },
  ],
};

const DIFF_COLOR = {
  easy:   { bg: "#0d1f12", text: "#4ade80", border: "#16572b" },
  medium: { bg: "#231a09", text: "#fbbf24", border: "#5c4310" },
  hard:   { bg: "#270d12", text: "#fb7185", border: "#5c1320" },
};

/* ════════════════════════════════════════════════════════════════════
   JAVA TRACK — Core + Concurrency + Collections + JVM internals,
   the depth an SDE3 panel actually probes (not "what is OOP")
   ════════════════════════════════════════════════════════════════════ */
const JAVA_TOPICS = [
  { id: "oop",     label: "OOP & Language Core", icon: "◆" },
  { id: "collections", label: "Collections Framework", icon: "▤" },
  { id: "concurrency", label: "Concurrency & Multithreading", icon: "⇄" },
  { id: "jvm",     label: "JVM Internals & GC", icon: "⚙" },
  { id: "memory",  label: "Memory Model & References", icon: "▣" },
  { id: "streams", label: "Streams, Lambdas & Functional", icon: "λ" },
  { id: "io",      label: "I/O & Serialization", icon: "⇵" },
  { id: "exceptions", label: "Exceptions & Error Handling", icon: "!" },
  { id: "advanced", label: "Advanced / Misc", icon: "✦" },
];

const JAVA_DATA = {
  oop: [
    { g: "Fundamentals (expect depth, not definitions)" },
    { r: 1, title: "Method overloading vs overriding — resolution at compile vs runtime", diff: "medium", tags: ["dispatch","binding"],
      points: ["Overloading resolved at compile time via static type (parameter list, not return type)","Overriding resolved at runtime via dynamic dispatch on actual object type","Covariant return types are allowed when overriding","Private/static/final methods cannot be overridden — they're statically bound","@Override annotation catches signature mismatches at compile time"] },
    { r: 2, title: "Static vs dynamic (virtual) method dispatch internals",  diff: "hard",   tags: ["vtable","JVM"],
      points: ["Instance methods use virtual dispatch via a method table (vtable-like) per class","Static, private, and constructor calls use direct (non-virtual) invocation","invokevirtual vs invokestatic vs invokespecial bytecode instructions","Field access is never polymorphic in Java — only methods are","super.method() forces invokespecial, bypassing dynamic dispatch"] },
    { r: 3, title: "Abstract class vs interface — default/static methods, diamond problem", diff: "medium", tags: ["interfaces","Java 8+"],
      points: ["Abstract class can hold state (fields) and constructors; interface (pre-Java 9) cannot hold instance state","Default methods (Java 8+) let interfaces provide implementation — enables API evolution without breaking implementers","Static methods on interfaces vs abstract classes","Diamond problem with two default methods of the same signature — must override explicitly","Private interface methods (Java 9+) for sharing code between default methods"] },
    { r: 4, title: "Composition vs inheritance — when panels expect you to justify the choice", diff: "medium", tags: ["design"],
      points: ["Inheritance models 'is-a', composition models 'has-a'","Fragile base class problem — base class changes silently break subclasses","Composition allows swapping behavior at runtime; inheritance is fixed at compile time","Favor composition when you need to combine independent behaviors (avoids multiple inheritance issues)","Effective Java's 'favor composition over inheritance' — concrete refactor example to be ready with"] },
    { g: "Object contracts" },
    { r: 5, title: "equals() / hashCode() contract and why breaking it corrupts HashMaps", diff: "medium", tags: ["contracts"],
      points: ["Contract: equal objects must have equal hashCodes (not the converse)","Reflexive, symmetric, transitive, consistent — the four equals() properties","Overriding equals() without hashCode() breaks HashMap/HashSet lookups silently","Mutable fields used in hashCode() break objects already stored in hash-based collections","getClass() check vs instanceof check in equals() — affects subclass equality semantics"] },
    { r: 6, title: "Comparable vs Comparator, and natural ordering pitfalls", diff: "easy",   tags: ["sorting"],
      points: ["Comparable.compareTo defines a single natural ordering on the class itself","Comparator allows multiple, external, swappable orderings","compareTo/compare must be consistent with equals() ideally (TreeSet/TreeMap rely on this, not equals())","Comparator.comparing / thenComparing for chained multi-key sorts","Integer overflow bug in naive (a - b) comparators — use Integer.compare instead"] },
    { r: 7, title: "Object cloning — shallow vs deep, Cloneable's design flaws", diff: "medium", tags: ["cloning"],
      points: ["Object.clone() is a shallow copy — nested mutable objects are shared, not duplicated","Cloneable is a marker interface with no clone() method itself — a known design wart","Deep clone requires manually cloning every mutable field, or copy constructors","Copy constructors / static factory copy methods are the Effective Java-recommended alternative","clone() can return a subtype object even when called via a supertype reference — easy to get wrong"] },
    { r: 8, title: "Immutability — designing a truly immutable class (defensive copies, final fields)", diff: "medium", tags: ["immutability"],
      points: ["All fields final and private, no setters","Defensive copies on construction and on getters for mutable fields (e.g. Date, arrays, collections)","Class itself should be final, or constructors private with static factories, to prevent subclass mutation","Builder pattern often pairs with immutable classes for many optional fields","Why immutable objects are inherently thread-safe — no synchronization needed for shared reads"] },
    { g: "Generics & type system" },
    { r: 9, title: "Generics & type erasure — why you can't do `new T()`",  diff: "hard",   tags: ["generics","erasure"],
      points: ["Generic type info exists only at compile time; erased to raw types (or bounds) at bytecode level","Why you can't create new T() or new T[] directly — no runtime type info to instantiate","Bridge methods generated by the compiler to preserve polymorphism after erasure","Passing a Class<T> token as a workaround to get runtime type information","Unchecked warnings and raw types — why mixing generic and non-generic code is unsafe"] },
    { r: 10, title: "Bounded wildcards — PECS (Producer Extends, Consumer Super)", diff: "hard",   tags: ["wildcards","variance"],
      points: ["? extends T for read-only producers; ? super T for write-only consumers","Why List<? extends Number> can't have add() called with a Number argument","Unbounded wildcard ? when neither reading nor writing depends on the type","Collections.copy(List<? super T> dest, List<? extends T> src) as the textbook PECS example","API design implication: wildcards make method signatures more flexible for callers"] },
    { r: 11, title: "Covariance, invariance & array covariance gotchas",     diff: "medium", tags: ["variance"],
      points: ["Arrays are covariant in Java (String[] is a Object[]) — generics are invariant by design","ArrayStoreException at runtime when array covariance is exploited with the wrong element type","Why generics chose invariance over covariance — compile-time type safety over runtime checks","Generic arrays cannot be created directly (new T[]) due to erasure + covariance conflict","List<String> is not a List<Object> — common source of confusion for newcomers"] },
    { g: "Enums, records & modern constructs" },
    { r: 12, title: "Enum internals — singleton-safety, EnumMap/EnumSet performance", diff: "medium", tags: ["enums"],
      points: ["Enums are compiled to final classes extending java.lang.Enum, with one instance per constant","Serialization-safe and reflection-safe singleton — can't be broken like a manual singleton","EnumMap/EnumSet use ordinal-based bit vectors/arrays internally — much faster than HashMap/HashSet","Enums can have constructors, fields, and abstract methods per-constant (strategy-like behavior)","valueOf/values() generated by compiler; switch on enum compiles to a jump table via ordinal"] },
    { r: 13, title: "Records (Java 14+) — compact constructors, when to prefer over POJOs", diff: "easy",   tags: ["records"],
      points: ["Auto-generates constructor, accessors, equals/hashCode/toString from the field list","Compact constructor syntax for validation without restating fields","Records are implicitly final and all fields are final — immutable by design","Cannot extend another class (records extend java.lang.Record implicitly)","Best fit for DTOs / value objects, not for entities needing mutable state or inheritance"] },
    { r: 14, title: "Sealed classes & pattern matching for switch (Java 17+)", diff: "medium", tags: ["sealed","pattern matching"],
      points: ["sealed restricts which classes can extend/implement a type — exhaustive subclass set known at compile time","Enables exhaustive switch expressions without a default branch","Pattern matching for switch with type patterns and guards (when clauses)","Record patterns for deconstructing record components directly in a switch/if","Use case: modeling a closed set of variants (e.g. Shape = Circle | Square | Triangle) type-safely"] },
  ],
  collections: [
    { g: "Map internals (most-asked Java topic at SDE3)" },
    { r: 15, title: "HashMap internals — bucket array, treeification at 8 collisions, resize/rehash", diff: "hard",   tags: ["HashMap","internals"],
      points: ["Backed by an array of buckets; each bucket is a linked list of Node objects (or a tree, see below)","hash(key) spread function (XOR of high/low 16 bits) reduces clustering before masking to bucket index","Load factor (default 0.75) triggers resize — table doubles, all entries rehashed","Java 8+: a bucket converts a linked list to a red-black tree once it has 8+ colliding entries (TREEIFY_THRESHOLD), reverts at 6","Iteration order is unspecified and can change across resizes — never rely on it","Null key allowed (exactly one), stored in bucket 0"] },
    { r: 16, title: "ConcurrentHashMap — segment locking (Java 7) vs CAS + node locking (Java 8+)", diff: "hard",   tags: ["concurrent collections"],
      points: ["Java 7: array of Segments, each independently lockable — fixed concurrency level set at construction","Java 8+: per-bucket synchronization using CAS for the first node insert, synchronized block only on bin head for collisions","No global lock for reads — get() is largely lock-free","size()/isEmpty() are approximate/eventually consistent under concurrent modification","Compound operations like putIfAbsent/computeIfAbsent are atomic, unlike doing get()+put() manually","Does not allow null keys or null values (unlike HashMap)"] },
    { r: 17, title: "LinkedHashMap — access order mode for building an LRU cache",  diff: "medium", tags: ["LRU"],
      points: ["Maintains a doubly linked list across entries on top of the HashMap structure","Insertion-order mode (default) vs access-order mode (accessOrder=true constructor flag)","removeEldestEntry() hook — override to evict the least-recently-used entry automatically","O(1) get/put while preserving usable iteration order — ideal base for an LRU cache","Still pays HashMap's resize cost; not the right choice if true random access ordering needed"] },
    { r: 18, title: "TreeMap — red-black tree backing, NavigableMap operations (floor/ceiling)", diff: "medium", tags: ["TreeMap"],
      points: ["Self-balancing red-black tree, O(log n) for get/put/remove","Keys are kept sorted by natural ordering or a supplied Comparator","NavigableMap API: floorKey, ceilingKey, higherKey, lowerKey, firstKey/lastKey","subMap/headMap/tailMap return live views, not copies","Throws ClassCastException if keys aren't mutually comparable and no Comparator is given"] },
    { g: "List & Set internals" },
    { r: 19, title: "ArrayList vs LinkedList — actual amortized costs, not folklore", diff: "easy",   tags: ["List"],
      points: ["ArrayList: O(1) amortized add at end, O(n) insert/remove at arbitrary index, O(1) random access","LinkedList: O(1) insert/remove at known node, O(n) get(index) since it must traverse","In practice ArrayList wins almost always due to cache locality — LinkedList's per-node overhead and pointer chasing hurt real-world perf","LinkedList implements Deque, so it doubles as a stack/queue","Capacity growth strategy for ArrayList (grows by ~1.5x) and the cost of repeated resizing without sizing hints"] },
    { r: 20, title: "CopyOnWriteArrayList — when reads-heavy concurrency justifies the write cost", diff: "medium", tags: ["concurrent collections"],
      points: ["Every mutation copies the entire underlying array — writes are O(n) and expensive","Reads never block and never throw ConcurrentModificationException — iterate over a stable snapshot","Best fit: many readers, very few writers (e.g. listener lists)","Iterator does not support remove/add/set (UnsupportedOperationException)","Memory cost: each write allocates a new array — bad fit for large lists or write-heavy workloads"] },
    { r: 21, title: "Fail-fast vs fail-safe iterators & ConcurrentModificationException", diff: "medium", tags: ["iterators"],
      points: ["Fail-fast iterators (ArrayList, HashMap) track a modCount and throw CME if structure changes during iteration","CME is a best-effort detection, not a guarantee — it's not for thread-safety, just bug-catching","Fail-safe iterators (CopyOnWriteArrayList, ConcurrentHashMap) iterate over a snapshot or are weakly consistent","Iterator.remove() is the safe way to remove during iteration, not list.remove()","ConcurrentModificationException can also occur single-threaded if you mutate while iterating with a for-each loop"] },
    { g: "Queues & deques" },
    { r: 22, title: "PriorityQueue internals — binary heap array representation", diff: "medium", tags: ["heap"],
      points: ["Backed by a resizable array representing a binary heap (parent at i, children at 2i+1, 2i+2)","Min-heap by default (or by a custom Comparator) — not necessarily sorted internally, only the head order is guaranteed","offer/poll are O(log n), peek is O(1)","Iterating the queue does NOT give sorted order — common interview gotcha","Not thread-safe — use PriorityBlockingQueue for concurrent use"] },
    { r: 23, title: "BlockingQueue family — ArrayBlockingQueue vs LinkedBlockingQueue vs SynchronousQueue", diff: "hard",   tags: ["producer-consumer"],
      points: ["ArrayBlockingQueue: fixed-capacity, single lock for both put/take (lower throughput under contention)","LinkedBlockingQueue: optionally bounded, separate locks for head/tail give higher throughput","SynchronousQueue: zero capacity — a put() must rendezvous directly with a take(), used in thread pool hand-off","PriorityBlockingQueue: unbounded priority queue with blocking take()","DelayQueue: elements become available only after their delay expires — useful for scheduling/retry logic"] },
    { r: 24, title: "Deque as both stack and queue — ArrayDeque vs Stack class (legacy)", diff: "easy",   tags: ["Deque"],
      points: ["ArrayDeque is the recommended replacement for both Stack and (non-blocking use of) LinkedList as a queue","Stack class is legacy, extends Vector, and is synchronized — unnecessary overhead for single-threaded use","ArrayDeque has no capacity restrictions and disallows null elements","push/pop/peek (stack) and offer/poll/peek (queue) both work on the same Deque instance","Backed by a resizable circular array, not a linked structure — better cache locality than LinkedList"] },
    { g: "Designing your own" },
    { r: 25, title: "Implement a thread-safe bounded LRU cache from scratch",  diff: "hard",   tags: ["design","concurrency"],
      points: ["Core structure: HashMap for O(1) lookup + doubly linked list for O(1) move-to-front eviction","Thread-safety options: a single ReentrantLock around get/put, or splitting read/write paths with ReadWriteLock","Eviction policy: evict tail of the linked list when capacity exceeded on put","Edge cases to call out: updating an existing key (move to front, don't double-insert), concurrent get() also counting as 'recently used'","Compare against just using LinkedHashMap with removeEldestEntry + synchronization wrapper"] },
    { r: 26, title: "Custom hashCode/equals for a key class used in a HashMap", diff: "medium", tags: ["correctness"],
      points: ["Use all fields that participate in equals() when computing hashCode, and only those","Objects.hash(...) for a quick, correct implementation; manual multiply-by-31 accumulation for performance-critical paths","Never use mutable fields in hashCode if the object will live in a hash-based collection","Document the contract if the class is meant to be subclassed (equals symmetry across subclasses)","Test: two equal objects must produce the same hash in different JVM runs if used for cross-process caching"] },
  ],
  concurrency: [
    { g: "Foundations" },
    { r: 27, title: "Thread lifecycle, Runnable vs Callable vs Thread subclassing", diff: "easy",   tags: ["threads"],
      points: ["States: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED","Runnable.run() returns void and can't throw checked exceptions; Callable.call() returns a value and can throw","Prefer implementing Runnable/Callable over extending Thread — keeps the class free to extend something else","start() vs run() — calling run() directly executes on the current thread, no new thread is created","Thread.join() to block the calling thread until the target thread finishes"] },
    { r: 28, title: "synchronized — monitor locks, intrinsic lock reentrancy, object vs class lock", diff: "medium", tags: ["locks"],
      points: ["Every object has an intrinsic monitor lock; synchronized methods/blocks acquire it on entry, release on exit (even via exception)","Reentrant — the same thread can re-acquire a lock it already holds (e.g. recursive synchronized calls)","Instance method sync locks 'this'; static method sync locks the Class object — two different locks","Synchronizing on a mutable or reassignable reference is a common bug (lock object identity must stay fixed)","No fairness guarantee and no timeout — a thread can wait indefinitely for a contended lock"] },
    { r: 29, title: "volatile — visibility guarantee vs atomicity, happens-before",  diff: "hard",   tags: ["JMM"],
      points: ["Guarantees visibility (writes are immediately visible to other threads) but NOT atomicity for compound actions like i++","Prevents instruction reordering around the volatile variable (no caching in CPU registers/thread-local memory)","Establishes a happens-before relationship: a write to a volatile field happens-before every subsequent read of it","Classic misuse: volatile boolean flag for a loop condition works; volatile counter for increments does not","Double-checked locking singleton requires the field to be volatile, or it can return a partially constructed object"] },
    { r: 30, title: "wait/notify/notifyAll — classic producer-consumer with a monitor", diff: "hard",   tags: ["wait-notify"],
      points: ["wait/notify/notifyAll must be called while holding the object's monitor (inside a synchronized block)","wait() releases the lock while waiting; notify() doesn't release it immediately — waiting thread re-acquires after notifier exits the block","Always wait() in a loop checking the condition (spurious wakeups, lost notifications)","notify() wakes one arbitrary waiting thread; notifyAll() wakes all — notifyAll is usually the safer default","IllegalMonitorStateException if called without holding the lock"] },
    { g: "java.util.concurrent" },
    { r: 31, title: "ExecutorService & thread pools — fixed vs cached vs scheduled, pool sizing math", diff: "hard",   tags: ["executors"],
      points: ["Executors.newFixedThreadPool / newCachedThreadPool / newScheduledThreadPool / newWorkStealingPool — when each fits","Underlying ThreadPoolExecutor knobs: corePoolSize, maxPoolSize, keepAliveTime, work queue type, RejectedExecutionHandler","CPU-bound sizing heuristic (~N cores) vs I/O-bound sizing (higher, since threads spend time blocked)","Unbounded queues (as in newFixedThreadPool's LinkedBlockingQueue) can hide backpressure problems and exhaust memory","shutdown() vs shutdownNow() — graceful drain vs forced interrupt of running tasks","Always set a thread name/UncaughtExceptionHandler — silent task failures are a common production issue"] },
    { r: 32, title: "Future, CompletableFuture — composing async pipelines (thenApply/thenCompose/allOf)", diff: "hard",   tags: ["async"],
      points: ["Future.get() blocks; CompletableFuture supports non-blocking composition and callbacks","thenApply (transform value) vs thenCompose (flatten a nested future) — the classic map vs flatMap distinction","thenCombine to join two independent futures' results","allOf/anyOf for fanning out and waiting on multiple async calls","Exception handling: exceptionally(), handle(), whenComplete() for recovering from async failures","Default callback execution happens on the completing thread unless you use the Async variants with an explicit Executor"] },
    { r: 33, title: "Locks package — ReentrantLock, ReadWriteLock, StampedLock vs synchronized", diff: "hard",   tags: ["locks"],
      points: ["ReentrantLock adds tryLock (non-blocking/timed acquire), fair-ordering option, and interruptible lock acquisition — synchronized has none of these","Must manually unlock in a finally block — easy to leak a lock if you forget","ReadWriteLock allows multiple concurrent readers but exclusive writer access — good for read-heavy shared state","StampedLock adds an optimistic read mode that avoids blocking entirely when no writes occur, validated after the fact","Condition objects (from ReentrantLock) replace wait/notify with multiple wait sets per lock"] },
    { r: 34, title: "CountDownLatch, CyclicBarrier, Semaphore, Phaser — when to use which", diff: "medium", tags: ["coordination"],
      points: ["CountDownLatch: one-time gate — wait until N events happen, then never resets","CyclicBarrier: all threads wait for each other at a point, then the barrier resets for reuse across phases","Semaphore: controls access to a limited number of permits — generalizes a lock to N concurrent holders","Phaser: a more flexible, reusable, dynamically-registering generalization of CyclicBarrier for multi-phase tasks","Use case mapping: latch for 'wait for startup', barrier for 'wait for all workers each round', semaphore for 'limit concurrent connections'"] },
    { r: 35, title: "Atomic classes — AtomicInteger/AtomicReference, CAS loops, ABA problem", diff: "medium", tags: ["lock-free"],
      points: ["Built on compare-and-swap (CAS) hardware instructions — lock-free, but can spin under heavy contention","compareAndSet returns false on conflict, enabling retry loops without blocking","ABA problem: a value changes from A to B and back to A — plain CAS can't detect the intermediate change","AtomicStampedReference / AtomicMarkableReference address ABA by attaching a version stamp","LongAdder/DoubleAdder reduce contention vs AtomicLong under very high-throughput counting by striping the counter"] },
    { r: 36, title: "ForkJoinPool & work-stealing — how parallelStream() actually executes", diff: "hard",   tags: ["fork-join"],
      points: ["Designed for divide-and-conquer recursive tasks (RecursiveTask/RecursiveAction) with fine-grained parallelism","Work-stealing: idle worker threads steal tasks from the tail of busy threads' deques to balance load","parallelStream() uses the common ForkJoinPool by default — shared across the whole JVM, including by unrelated code","Blocking I/O inside a parallel stream task can starve the shared pool for everyone — a frequent production footgun","ForkJoinPool.commonPool() size defaults to (availableProcessors - 1)"] },
    { g: "Failure modes (panels love these)" },
    { r: 37, title: "Deadlock, livelock, starvation — causes and detection strategies", diff: "hard",   tags: ["failure modes"],
      points: ["Deadlock: circular wait on locks — classic fix is consistent lock ordering across all threads","Livelock: threads keep changing state in response to each other but make no progress (e.g. both repeatedly backing off)","Starvation: a thread never gets CPU time or lock access due to scheduling/priority bias","jstack thread dumps to detect deadlocks — the JVM can directly report 'Found one Java-level deadlock'","Avoidance strategies: lock ordering, lock timeouts (tryLock), avoiding nested locks, using higher-level concurrency utilities instead of raw locks"] },
    { r: 38, title: "Designing a deadlock-free solution for dining philosophers", diff: "hard",   tags: ["classic problem"],
      points: ["Naive solution (each philosopher grabs left then right fork) deadlocks when all grab their left fork simultaneously","Fix 1: resource ordering — always acquire the lower-numbered fork first","Fix 2: arbitrator/waiter — a central coordinator grants fork pairs atomically","Fix 3: limit concurrent diners to N-1 to guarantee at least one can always complete","Be ready to discuss the tradeoffs of each fix (throughput vs simplicity vs fairness)"] },
    { r: 39, title: "Producer-consumer with bounded buffer — 3 implementations (wait/notify, BlockingQueue, Semaphore)", diff: "hard",   tags: ["classic problem"],
      points: ["wait/notify: producers wait while buffer full, consumers wait while empty, both notify on state change","BlockingQueue: put()/take() block internally — implementation detail hidden, far less error-prone","Semaphore-based: 'empty slots' and 'filled slots' semaphores guard capacity without explicit wait/notify","Discuss why the BlockingQueue version is what you'd actually ship, and the others are for demonstrating understanding","Edge cases: multiple producers/consumers, graceful shutdown (poison pill pattern)"] },
    { r: 40, title: "Thread-safe singleton — double-checked locking & why volatile matters here", diff: "medium", tags: ["singleton"],
      points: ["Eager initialization (static final field) — simplest, thread-safe by class-loading guarantees, no laziness","Synchronized getInstance() — correct but pays a lock on every call after the first","Double-checked locking — null check outside and inside a synchronized block to minimize locking overhead","Why the instance field MUST be volatile in double-checked locking — without it, another thread can see a partially constructed object due to reordering","Initialization-on-demand holder idiom — uses the JVM's class-loading guarantees for a lock-free, lazy, thread-safe singleton"] },
  ],
  jvm: [
    { g: "Class loading & execution" },
    { r: 41, title: "Classloader hierarchy — bootstrap/platform/app, delegation model",  diff: "medium", tags: ["classloading"],
      points: ["Bootstrap (loads core java.* classes) → Platform/Extension → Application/System classloader, each delegating upward first","Parent delegation model — a classloader asks its parent before trying to load a class itself, preventing core class spoofing","Custom classloaders (e.g. for plugin systems) override findClass to load from non-standard sources","Same class loaded by two different classloaders is treated as two distinct types — a common source of ClassCastException in app servers/plugin frameworks","Linking phases: verification, preparation, resolution; then initialization runs static initializers"] },
    { r: 42, title: "JIT compilation — interpreter vs C1/C2 tiers, hotspot inlining",   diff: "hard",   tags: ["JIT"],
      points: ["Code starts interpreted; the JVM profiles it and JIT-compiles 'hot' methods to native code","C1 (client compiler) does fast, lightly-optimized compilation; C2 (server compiler) does slower, heavily-optimized compilation for very hot code","Tiered compilation moves a method through interpreter → C1 → C2 as it gets hotter","Method inlining is one of the biggest JIT wins — small, frequently-called methods are inlined into callers","Deoptimization — the JVM can fall back from compiled code to the interpreter if an assumption (e.g. a monomorphic call site) is invalidated"] },
    { r: 43, title: "Bytecode basics — what javap shows you and why it matters for perf debugging", diff: "medium", tags: ["bytecode"],
      points: ["javap -c disassembles a class file into JVM bytecode instructions","Common opcodes to recognize: invokevirtual/invokestatic/invokespecial/invokeinterface, aload/astore, getfield/putfield","Autoboxing shows up as explicit Integer.valueOf()/intValue() calls — useful for spotting hidden boxing overhead","String concatenation in a loop compiles to repeated StringBuilder allocation pre-Java 9, or invokedynamic with StringConcatFactory post-9","Bytecode verification at class-load time enforces type and stack-safety before execution"] },
    { g: "Garbage collection" },
    { r: 44, title: "Generational hypothesis — young/old gen, minor vs major/full GC", diff: "medium", tags: ["GC"],
      points: ["Hypothesis: most objects die young — so the heap is split into young (Eden + 2 Survivor spaces) and old generation","Minor GC cleans the young generation frequently and quickly; objects surviving enough cycles get promoted to old gen","Major/Full GC cleans the old generation (and often everything) — much more expensive, causes longer pauses","Metaspace (replacing PermGen since Java 8) stores class metadata, separate from the regular heap","TLAB (Thread-Local Allocation Buffer) lets each thread allocate without synchronizing on every object creation"] },
    { r: 45, title: "GC algorithms — G1, ZGC, Shenandoah: pause-time tradeoffs",        diff: "hard",   tags: ["GC algorithms"],
      points: ["G1 (default since Java 9): region-based, divides heap into many regions, collects the most garbage-dense ones first","ZGC: colored pointers + load barriers enable sub-millisecond pauses even on multi-terabyte heaps","Shenandoah: similar concurrent-compaction goals to ZGC, different implementation (Brooks pointers)","Parallel GC (throughput-focused, stop-the-world) vs G1/ZGC/Shenandoah (latency-focused, mostly concurrent)","Choosing a GC is a throughput vs pause-time tradeoff — batch jobs may prefer Parallel GC, latency-sensitive services prefer G1/ZGC"] },
    { r: 46, title: "Tuning heap & GC flags for a latency-sensitive service",   diff: "hard",   tags: ["tuning"],
      points: ["-Xms/-Xmx to fix heap size and avoid resize pauses; setting them equal avoids dynamic heap resizing overhead","-XX:MaxGCPauseMillis as a target (not a hard guarantee) for G1's adaptive sizing","Sizing young generation explicitly when minor GC frequency/pause is the bottleneck, not old gen","GC logging (-Xlog:gc*) to actually observe pause frequency/duration before tuning blindly","Common mistake: tuning flags without first profiling — start by measuring, not guessing"] },
    { r: 47, title: "Diagnosing a memory leak with heap dumps & GC logs",       diff: "hard",   tags: ["debugging"],
      points: ["Symptom: old-gen usage climbs steadily across full GCs and never drops back down — true leak vs just a large working set","jmap/jcmd to trigger a heap dump (.hprof) for offline analysis","Eclipse MAT or VisualVM to find the dominator tree and identify what's retaining the most memory","Look for unexpected growth in a specific collection (cache without eviction, listener list never cleaned up)","GC logs showing increasing time-to-collect and shrinking reclaimed space per cycle as a leading indicator before OOM"] },
    { g: "JVM tuning at scale" },
    { r: 48, title: "Reading thread dumps to diagnose a production hang",      diff: "hard",   tags: ["debugging"],
      points: ["jstack <pid> or kill -3 to dump all thread stacks with their current state and lock info","Look for threads BLOCKED on the same lock — points to contention or deadlock","'Found one Java-level deadlock' section the JVM prints automatically when applicable","High CPU but no progress often means a busy-spin loop, not a blocked lock — check RUNNABLE threads' stack traces instead","Correlate thread dump with GC logs — sometimes a 'hang' is actually a long GC pause, not application logic"] },
    { r: 49, title: "JMH micro-benchmarking pitfalls — dead code elimination, warmup", diff: "medium", tags: ["benchmarking"],
      points: ["JIT warmup means cold-start measurements are misleading — JMH includes explicit warmup iterations","Dead code elimination: the JIT can optimize away a computation whose result is never used — always consume results via Blackhole","Constant folding: benchmarking with compile-time-constant inputs can let the JIT precompute the answer, skewing results","Loop unrolling and inlining differences between a microbenchmark harness and real call sites can produce non-representative numbers","Why 'just wrap it in a for loop and System.currentTimeMillis()' is not a valid benchmark methodology"] },
  ],
  memory: [
    { g: "Java Memory Model" },
    { r: 50, title: "Stack vs heap — where objects, references, and primitives live", diff: "easy",   tags: ["memory layout"],
      points: ["Each thread has its own stack holding local variables, primitives, and references (pointers) to heap objects","Heap is shared across all threads — all objects (including boxed primitives, arrays) live here","Stack memory is reclaimed automatically when a method frame pops — no GC involvement","StackOverflowError from excessive/unbounded recursion vs OutOfMemoryError from heap exhaustion — different root causes, different fixes","Escape analysis can let the JIT allocate some objects on the stack (or eliminate them) if they provably never escape a method"] },
    { r: 51, title: "Happens-before relationship & the JMM specification",     diff: "hard",   tags: ["JMM"],
      points: ["Happens-before is the formal ordering guarantee the JMM provides across threads — without it, reordering is legal","Sources of happens-before: volatile write→read, monitor unlock→lock, Thread.start()→actions in the new thread, Thread.join() completion","Without synchronization, one thread may never observe another thread's writes at all (not just see them late)","The JMM permits compiler/CPU instruction reordering as long as single-threaded semantics are preserved — this is what causes surprising multithreaded bugs","Final field semantics — a correctly-constructed object's final fields are guaranteed visible without extra synchronization (safe construction)"] },
    { r: 52, title: "String pool & String.intern() — why string concatenation in loops hurts", diff: "medium", tags: ["strings"],
      points: ["String literals are interned automatically into a pool (stored in heap since Java 7, not PermGen)","new String(\"x\") creates a new heap object even if \"x\" is already in the pool — .equals() still works, == does not",".intern() manually adds/retrieves a string from the pool — useful for deduplicating many repeated runtime strings","String concatenation with + in a loop creates a new String/StringBuilder each iteration pre-optimization — use StringBuilder explicitly for clarity and to avoid relying on compiler optimization","Strings are immutable specifically so they can be safely shared via the pool and used as HashMap keys"] },
    { g: "References & leaks" },
    { r: 53, title: "Strong/soft/weak/phantom references — WeakHashMap use cases", diff: "hard",   tags: ["references"],
      points: ["Strong: normal references, never GC'd while reachable","Soft: GC'd only when memory is needed — good for memory-sensitive caches","Weak: GC'd as soon as no strong references remain, even if memory isn't needed — used in WeakHashMap for keys that shouldn't be kept alive by the map itself","Phantom: enqueued after finalization but before reclamation — used for precise cleanup actions (replacing finalize())","WeakHashMap real use case: caching metadata keyed by a class/object that should be evictable once nothing else references it"] },
    { r: 54, title: "Common memory leak patterns — static collections, listener leaks, inner class refs", diff: "medium", tags: ["leaks"],
      points: ["Static collections (caches, registries) that only grow and never evict — classic unbounded-cache leak","Listener/observer registration without corresponding deregistration — listeners outlive the object they were meant to observe","Non-static inner classes implicitly hold a reference to their enclosing instance, preventing it from being GC'd","ThreadLocal values not cleaned up in thread-pool threads that get reused — leaks across logical 'requests'","Unclosed resources (streams, connections) relying on finalize() instead of try-with-resources"] },
    { r: 55, title: "Off-heap memory & direct ByteBuffers — when and why",     diff: "medium", tags: ["off-heap"],
      points: ["Direct ByteBuffers (ByteBuffer.allocateDirect) live outside the regular GC-managed heap","Benefit: avoids extra copy between JVM heap and native memory for I/O operations (used heavily by NIO)","Cost: allocation/deallocation is more expensive than heap allocation, and cleanup depends on GC-triggered Cleaner, which can be unpredictable","Use case: high-throughput network/file I/O buffers, off-heap caches (e.g. Chronicle Map) to avoid GC pause impact from huge heaps","Memory-mapped files (MappedByteBuffer) as another off-heap technique for large file access"] },
  ],
  streams: [
    { g: "Functional interfaces & lambdas" },
    { r: 56, title: "Functional interfaces — Function, Predicate, Supplier, Consumer, BiFunction", diff: "easy",   tags: ["functional"],
      points: ["Functional interface = exactly one abstract method (default/static methods don't count) — enables lambda assignment","Function<T,R> transforms; Predicate<T> tests a condition; Supplier<T> produces with no input; Consumer<T> accepts with no output","BiFunction/BiPredicate/BiConsumer for two-argument variants","UnaryOperator<T> and BinaryOperator<T> as specializations of Function/BiFunction where input and output types match","@FunctionalInterface annotation is optional but enforces the single-abstract-method contract at compile time"] },
    { r: 57, title: "Method references vs lambdas — when each reads better",   diff: "easy",   tags: ["lambdas"],
      points: ["Four forms: static (Class::staticMethod), bound instance (obj::method), unbound instance (Class::instanceMethod), constructor (Class::new)","Method references read more clearly when simply delegating to an existing named method with no extra logic","Lambdas are better when you need inline logic, multiple statements, or to capture local variables meaningfully","Both compile down to similar invokedynamic-based call sites, not to anonymous inner classes (a common misconception)","Effectively-final capture rule — lambdas can only capture local variables that aren't reassigned after capture"] },
    { g: "Stream API depth" },
    { r: 58, title: "Stream pipeline laziness — intermediate vs terminal ops, short-circuiting", diff: "medium", tags: ["streams"],
      points: ["Intermediate operations (map, filter, sorted) are lazy — nothing executes until a terminal operation is invoked","Terminal operations (collect, forEach, reduce, count) trigger the actual traversal","Short-circuiting operations (findFirst, anyMatch, limit) can stop processing early without consuming the whole stream","A stream can only be consumed once — reusing a stream after a terminal op throws IllegalStateException","Stateful intermediate ops (sorted, distinct) may need to buffer the whole stream internally, unlike stateless ones (map, filter)"] },
    { r: 59, title: "Collectors — groupingBy, partitioningBy, downstream collectors, teeing", diff: "medium", tags: ["collectors"],
      points: ["groupingBy(classifier) groups into a Map<K, List<T>>; pass a downstream collector to aggregate each group differently (counting, summing, mapping)","partitioningBy splits into exactly two groups (true/false) keyed by a Predicate — always produces both keys even if one is empty","toMap requires a merge function when keys can collide, or it throws IllegalStateException","Collectors.teeing (Java 12+) combines results of two collectors into one — useful for computing two aggregates in a single pass","Custom Collector via Collector.of() when none of the built-ins fit (supplier, accumulator, combiner, finisher)"] },
    { r: 60, title: "Parallel streams — when they help vs silently hurt (splitting cost, false sharing)", diff: "hard",   tags: ["parallel streams"],
      points: ["Parallel streams use the shared common ForkJoinPool — competing with other unrelated parallel work in the same JVM","Benefit only shows up for CPU-bound work on large enough datasets — splitting/merging overhead dominates for small collections","Source matters: ArrayList/arrays split efficiently (cheap, balanced); LinkedList/Streams from iterators split poorly","Side-effecting lambdas (mutating shared state) in parallel streams cause race conditions — must be stateless","Blocking I/O inside a parallel stream task starves the shared pool for the whole application, not just that call"] },
    { r: 61, title: "Optional — proper usage, anti-patterns (Optional.get() without isPresent)", diff: "easy",   tags: ["Optional"],
      points: ["Intended for return types signaling 'may be absent' — not meant for fields or method parameters","Optional.get() without checking isPresent()/isEmpty() defeats the entire purpose — prefer orElse/orElseGet/orElseThrow","map/flatMap let you chain transformations without manual null checks","Optional.ofNullable vs Optional.of — of() throws NPE immediately if the value is null, ofNullable handles it gracefully","Don't use Optional as a substitute for proper exception handling when absence is actually an error condition"] },
  ],
  io: [
    { g: "I/O models" },
    { r: 62, title: "java.io vs java.nio — blocking streams vs channels & buffers", diff: "medium", tags: ["I/O"],
      points: ["java.io is stream-oriented and blocking — one thread per connection model","java.nio is buffer/channel-oriented and supports non-blocking mode via Selectors","ByteBuffer has position/limit/capacity semantics that trip people up — flip()/clear()/compact() exist for a reason","FileChannel supports memory-mapped files and direct transferTo/transferFrom (zero-copy) between channels","java.nio.file (NIO.2, Java 7+) Path/Files API replaced much of the old File class's clunky error handling"] },
    { r: 63, title: "NIO Selector — building a single-threaded event loop for many connections", diff: "hard",   tags: ["NIO","event loop"],
      points: ["A single Selector can monitor many SocketChannels for readiness (read/write/accept/connect) without one thread per connection","SelectionKey interest sets define which events a channel is registered for","select() blocks until at least one registered channel is ready, then you iterate the selected-key set","Must explicitly remove handled keys from the selected-key set, or they reappear next loop","This is the same fundamental model as epoll/select in OS networking — explains why frameworks like Netty are built on NIO"] },
    { r: 64, title: "Try-with-resources & AutoCloseable — suppressed exceptions", diff: "easy",   tags: ["resource mgmt"],
      points: ["Resources declared in try(...) are closed automatically in reverse declaration order, even on exception","AutoCloseable.close() being called doesn't suppress an exception from the try block — instead, a close()-time exception becomes a 'suppressed exception' attached to the original","Always prefer try-with-resources over manual finally-block closing — eliminates a whole class of resource-leak bugs","Multiple resources in one try-with-resources statement, separated by semicolons","Closeable vs AutoCloseable — Closeable's close() is idempotent and only throws IOException; AutoCloseable's is more general"] },
    { g: "Serialization" },
    { r: 65, title: "Java serialization pitfalls — versioning, serialVersionUID, security risks", diff: "medium", tags: ["serialization"],
      points: ["serialVersionUID should be declared explicitly — relying on the computed default makes deserialization brittle across compiler/JVM versions","Adding/removing fields can break deserialization of old data unless handled via custom readObject/writeObject or versioning strategy","transient fields are skipped during serialization — used for derived/non-serializable state","Security risk: deserializing untrusted data can trigger arbitrary code execution via gadget chains — a well-known attack class","Most modern systems avoid native Java serialization for anything crossing a trust boundary, preferring JSON/Protobuf instead"] },
    { r: 66, title: "Jackson/Gson under the hood — reflection-based (de)serialization cost", diff: "medium", tags: ["JSON"],
      points: ["Default behavior uses reflection to discover fields/getters/setters — has real per-call overhead vs hand-written mapping code","Jackson can generate bytecode-based serializers (afterburner module) or use annotation processors to avoid reflection cost at runtime","Custom (de)serializers needed for types that don't map cleanly (e.g. polymorphic types, custom date formats)","@JsonIgnore, @JsonProperty, @JsonCreator — common annotations for controlling the mapping explicitly","Streaming APIs (JsonParser/JsonGenerator) avoid building a full in-memory tree for very large JSON payloads"] },
  ],
  exceptions: [
    { g: "Exception design" },
    { r: 67, title: "Checked vs unchecked — designing your own exception hierarchy for an API", diff: "medium", tags: ["exceptions"],
      points: ["Checked exceptions force callers to handle or declare them — appropriate for recoverable conditions the caller should plan for","Unchecked (RuntimeException) for programming errors / unrecoverable conditions — caller usually can't sensibly recover","Effective Java guidance: use checked exceptions sparingly; over-use leads to clutter (catch-and-ignore, wrapping in RuntimeException anyway)","Custom exception hierarchies should carry enough context (error codes, causal chain) for callers to act on, not just a message string","Always preserve the original cause via the constructor that takes a Throwable, to keep the full stack trace chain"] },
    { r: 68, title: "Try/finally semantics — what happens with return in both blocks",  diff: "easy",   tags: ["control flow"],
      points: ["finally always runs, even if try/catch returns, throws, or breaks/continues out of a loop","A return inside finally silently overrides a return/exception from the try block — a well-known footgun, avoid returning from finally","An exception thrown in finally replaces (suppresses) an exception from the try block unless using try-with-resources' suppressed-exception mechanism","System.exit() in the try block is one of the few things that can prevent finally from running at all","Resources should be closed in finally only when try-with-resources isn't applicable (e.g. pre-Java 7 code)"] },
    { r: 69, title: "Exception handling in streams/lambdas — wrapping checked exceptions cleanly", diff: "medium", tags: ["streams"],
      points: ["Functional interfaces like Function/Consumer don't declare checked exceptions — a checked exception inside a lambda won't compile unless caught locally","Common pattern: wrap the checked exception in an unchecked one inside the lambda, rethrow, and unwrap at a higher level if needed","Libraries like vavr or custom 'ThrowingFunction' wrapper interfaces exist specifically to bridge this gap","Avoid the temptation to swallow exceptions silently just to satisfy the compiler inside a stream pipeline","Sometimes the cleanest fix is to not use a stream at all when the body must handle checked exceptions per element"] },
    { r: 70, title: "Custom error codes vs exceptions — API design tradeoffs at scale", diff: "medium", tags: ["API design"],
      points: ["Exceptions carry a stack trace (cost) and disrupt control flow (clarity in some cases, overhead in hot paths)","Error codes / Result-style return types avoid exception overhead but push validation responsibility onto every caller","Hybrid approach common in high-throughput systems: exceptions for truly exceptional/rare paths, result objects for expected failure modes (e.g. validation errors)","Exception cost mostly comes from stack trace capture (fillInStackTrace) — can be mitigated by disabling it for performance-critical custom exceptions","Discuss this in context of a specific API you've designed — panels want a real tradeoff, not a rule recited from memory"] },
  ],
  advanced: [
    { g: "JVM languages & tooling" },
    { r: 71, title: "Reflection API — performance cost, where frameworks (Spring) rely on it", diff: "medium", tags: ["reflection"],
      points: ["Reflective method/field access bypasses normal JIT optimization paths — historically much slower, though modern JVMs have narrowed the gap with method handles","setAccessible(true) bypasses Java's access control checks (private/protected) — powerful but a known security/encapsulation hazard","Spring/Hibernate rely heavily on reflection for dependency injection, proxying, and ORM field mapping","Class.forName, getDeclaredFields, Method.invoke — the core APIs interview questions probe","MethodHandles (since Java 7) as a faster, more type-safe alternative to classic reflection for repeated invocations"] },
    { r: 72, title: "Annotations & annotation processing — how Lombok/MapStruct generate code", diff: "medium", tags: ["annotations"],
      points: ["Retention policies: SOURCE (compile-time only), CLASS (in bytecode, not loaded at runtime), RUNTIME (available via reflection)","Annotation processors hook into javac to generate additional source files at compile time (MapStruct, Dagger)","Lombok works differently — it manipulates the in-memory AST during compilation, which is why it's somewhat controversial/IDE-dependent","Meta-annotations like @Retention, @Target, @Inherited define how a custom annotation itself behaves","Difference between compile-time code generation (MapStruct) and runtime reflection-based processing (Jackson) for similar-looking problems"] },
    { r: 73, title: "Dynamic proxies — how Spring AOP / Hibernate lazy-loading use them", diff: "hard",   tags: ["proxies"],
      points: ["java.lang.reflect.Proxy creates a runtime-generated class implementing a set of interfaces, delegating calls to an InvocationHandler","JDK dynamic proxies require an interface; CGLIB/ByteBuddy-based proxies subclass a concrete class instead — Spring AOP uses whichever fits the bean","Hibernate lazy-loading returns a proxy object in place of the real entity, triggering the actual DB fetch only on first real method access","AOP cross-cutting concerns (logging, transactions, security) are typically implemented by wrapping the real object in a proxy that runs advice before/after delegating","Proxies add a method-call indirection cost — usually negligible compared to what they wrap (DB calls, business logic)"] },
    { g: "Modern Java" },
    { r: 74, title: "Virtual threads (Project Loom, Java 21) — how they change concurrency tradeoffs", diff: "hard",   tags: ["virtual threads"],
      points: ["Virtual threads are lightweight, JVM-managed threads multiplexed onto a small pool of OS (platform) threads","Blocking calls (I/O) on a virtual thread don't block the underlying OS thread — the JVM parks and reschedules it, unlike platform threads","Enables the simple 'one thread per request' programming model to scale to millions of concurrent virtual threads without the old thread-pool sizing problem","Thread-local heavy code and synchronized blocks can pin a virtual thread to its carrier thread, partially defeating the benefit — a real migration gotcha","Structured concurrency (related JEP) aims to make managing groups of related virtual-thread tasks safer and more composable"] },
    { r: 75, title: "Module system (JPMS) — what problem it actually solves",   diff: "easy",   tags: ["modules"],
      points: ["Solves 'JAR hell' / classpath ambiguity by making module boundaries and dependencies explicit (module-info.java)","Strong encapsulation — a module only exposes packages it explicitly 'exports', unlike the classpath's all-public-by-default behavior","requires/exports/opens directives control compile-time visibility vs runtime reflective access","Reduces base JVM footprint via jlink, letting you ship a custom minimal runtime image with only needed modules","Adoption has been slow/optional in many codebases — most libraries still ship as unnamed/automatic modules on the classpath"] },
    { r: 76, title: "var type inference & target typing — where it helps vs hurts readability", diff: "easy",   tags: ["syntax"],
      points: ["var infers the type from the right-hand side at compile time — it's still statically typed, not dynamic typing","Helps readability when the type is obvious from context (e.g. var list = new ArrayList<String>()) by removing redundant boilerplate","Hurts readability when the inferred type isn't obvious from the right-hand side (e.g. var result = service.process(x))","Cannot be used for fields, method parameters, or return types — local variables only","Style guidance many teams adopt: use var only when the declared type would otherwise just repeat what's already visible on the same line"] },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   LLD TRACK — OO Design Principles + Patterns + Machine Coding problems
   ════════════════════════════════════════════════════════════════════ */
const LLD_TOPICS = [
  { id: "principles", label: "OO Principles & SOLID", icon: "◇" },
  { id: "creational",  label: "Creational Patterns", icon: "✚" },
  { id: "structural",  label: "Structural Patterns", icon: "▦" },
  { id: "behavioral",  label: "Behavioral Patterns", icon: "↺" },
  { id: "concurrency_lld", label: "Concurrency in Design", icon: "⇄" },
  { id: "machine_coding", label: "Machine Coding Problems", icon: "⌨" },
];

const LLD_DATA = {
  principles: [
    { g: "SOLID — the baseline every panel checks" },
    { r: 1, title: "Single Responsibility — splitting a class with mixed concerns",  diff: "easy",   tags: ["SRP"],
      points: ["A class should have one reason to change — one cohesive responsibility, not one method","Symptom of violation: a class that mixes persistence, validation, and business logic together","Splitting strategy: extract collaborators (e.g. Validator, Repository) and inject them rather than inlining logic","Over-splitting into too many tiny classes is also a smell — SRP is about cohesion, not minimal line count","Be ready with a before/after example: a 'God class' refactored into focused collaborators"] },
    { r: 2, title: "Open/Closed — extending behavior without modifying existing code", diff: "medium", tags: ["OCP"],
      points: ["New behavior should be addable via extension (new subclass/implementation) without editing existing, tested code","Strategy pattern and polymorphism are the usual mechanism for satisfying OCP","A long if/else or switch on a 'type' field that keeps growing is the classic OCP violation","Plugin architectures (e.g. payment gateway providers) are OCP applied at a system level","Tradeoff: over-engineering for 'future extension' that never comes is a real cost — apply OCP where change is actually likely"] },
    { r: 3, title: "Liskov Substitution — why a Square extending Rectangle breaks it", diff: "medium", tags: ["LSP"],
      points: ["Subtypes must be substitutable for their base type without breaking caller expectations","Square extending Rectangle breaks LSP because setting width independently of height (valid for Rectangle) violates Square's invariant","Violations often show up as overridden methods that throw UnsupportedOperationException for some subtype","Preconditions can't be strengthened, and postconditions can't be weakened, in an override","LSP violations are a strong signal that inheritance was the wrong tool — composition or a different hierarchy may fit better"] },
    { r: 4, title: "Interface Segregation — fat interfaces and role interfaces",     diff: "easy",   tags: ["ISP"],
      points: ["Clients shouldn't be forced to depend on methods they don't use — split large interfaces into smaller, role-specific ones","Classic example: a Worker interface with work() and eat() forces a Robot implementation to throw on eat()","Role interfaces (e.g. Readable, Writable, Closeable in Java I/O) compose into what a class actually needs","ISP and SRP are related but distinct — ISP is about interface shape from the client's perspective, SRP is about class cohesion","Watch for interfaces that have grown multiple unrelated methods over time as a team adds features"] },
    { r: 5, title: "Dependency Inversion — depend on abstractions, constructor injection", diff: "medium", tags: ["DIP"],
      points: ["High-level modules shouldn't depend on low-level module details — both should depend on abstractions","Constructor injection (passing dependencies in via constructor) is preferred over field injection for testability and immutability","DIP enables swapping implementations (e.g. a fake repository in tests) without touching the consuming class","Don't confuse DIP with Dependency Injection frameworks — DIP is the principle, DI/IoC containers are one way to apply it","A service depending directly on a concrete database class instead of a Repository interface is the textbook violation"] },
    { g: "Other core principles" },
    { r: 6, title: "DRY, KISS, YAGNI — and when over-applying them backfires",       diff: "easy",   tags: ["principles"],
      points: ["DRY (Don't Repeat Yourself) — but premature abstraction to remove superficially similar code can create wrong, brittle shared logic","KISS (Keep It Simple) — favor the straightforward solution unless complexity is justified by a real requirement","YAGNI (You Aren't Gonna Need It) — avoid building flexibility/abstraction for hypothetical future requirements","Tension between DRY and SRP: two pieces of code that look similar today may change for different reasons later — don't merge them just because they're textually similar","Panels often want you to recognize the tradeoff, not recite the acronym"] },
    { r: 7, title: "Law of Demeter — avoiding train-wreck method chains (a.getB().getC())", diff: "medium", tags: ["coupling"],
      points: ["'Talk only to your immediate friends' — a method should only call methods on objects it directly holds, not objects reached through them","a.getB().getC().doSomething() couples the caller to B's and C's internal structure, not just A's","Violating it makes refactoring B or C's internals risky since far-away callers depend on the chain","Fix: have A expose a method that internally delegates (e.g. a.doSomethingOnC()) instead of exposing the chain","Not an absolute rule — fluent builders intentionally chain calls on the same object, which is different from reaching through unrelated objects"] },
    { r: 8, title: "Composition over inheritance — a worked refactor example",       diff: "medium", tags: ["composition"],
      points: ["Be ready to walk through a concrete before/after: e.g. a Bird hierarchy broken by FlightlessBird needing to override fly()","Composition refactor: extract a FlightBehavior interface/strategy and inject it instead of overriding a base method","Composition supports runtime behavior changes (swap the injected strategy); inheritance is fixed at compile time","Multiple inheritance of behavior (mixing in several capabilities) is naturally handled via composing multiple interfaces, harder via single inheritance","Don't over-correct — composition isn't always better; simple, stable 'is-a' relationships are fine with inheritance"] },
    { r: 9, title: "Designing extensible APIs — versioning, backward compatibility", diff: "medium", tags: ["API design"],
      points: ["Additive changes (new optional fields/methods) are usually backward compatible; removing or renaming is not","Semantic versioning communicates the blast radius of a change to consumers (major.minor.patch)","Deprecation strategy: mark old methods @Deprecated with a migration path before removal, not a silent break","Default methods on interfaces (Java 8+) let you add behavior to an existing interface without breaking implementers","Designing for extension points (e.g. accepting a Comparator, a Predicate, a Strategy object) up front avoids painful API breaks later"] },
  ],
  creational: [
    { g: "Object creation patterns" },
    { r: 10, title: "Singleton — thread-safe lazy init, enum singleton, breaking via reflection/serialization", diff: "medium", tags: ["singleton"],
      points: ["Enum singleton is the simplest reflection-safe, serialization-safe approach in Java","Double-checked locking with a volatile field for lazy thread-safe initialization without per-call locking cost","Initialization-on-demand holder idiom leverages class-loading guarantees for a lock-free lazy singleton","Reflection can break a private-constructor singleton by calling setAccessible(true) — enum singletons resist this","Singleton makes unit testing harder (global shared state, hard to mock) — be ready to discuss this downside unprompted"] },
    { r: 11, title: "Factory Method — decoupling object creation from usage",        diff: "easy",   tags: ["factory"],
      points: ["Defines an interface/abstract method for creating an object, letting subclasses decide the concrete type","Decouples client code from concrete classes — client depends only on the abstraction returned","Common in frameworks: a base class defines the algorithm, subclasses override the factory method to plug in the right object","Different from a simple static factory method (e.g. a createX() helper) — Factory Method as a GoF pattern relies on subclass polymorphism","Use when you anticipate multiple product variants but don't want client code to know which one it's getting"] },
    { r: 12, title: "Abstract Factory — families of related objects (e.g. cross-platform UI)", diff: "medium", tags: ["abstract factory"],
      points: ["Produces a family of related objects (e.g. Button + Checkbox) that must be consistent with each other (same UI theme)","Client depends only on the abstract factory interface, never on concrete product classes","Classic example: WindowsFactory vs MacFactory each producing matching Button/Checkbox/Scrollbar implementations","Distinguishes from Factory Method by scope — Abstract Factory creates multiple related products, Factory Method typically creates one","Adding a new product to the family requires changing the abstract factory interface and all concrete factories — a real OCP tension to flag"] },
    { r: 13, title: "Builder — fluent construction for objects with many optional fields", diff: "easy",   tags: ["builder"],
      points: ["Solves the 'telescoping constructor' problem where a class has many optional parameters","Fluent API (method chaining returning 'this') reads like a sentence and avoids parameter-order bugs","Builder can validate the final object's invariants in a build() method before returning it","Pairs naturally with immutable classes — builder accumulates state, then produces a fully-formed immutable object","Lombok's @Builder generates this boilerplate automatically — know both the manual and generated version"] },
    { r: 14, title: "Prototype — cloning pre-configured objects instead of rebuilding", diff: "medium", tags: ["prototype"],
      points: ["Creates new objects by copying an existing pre-configured instance rather than constructing from scratch","Useful when object creation is expensive (e.g. requires a DB call or heavy computation to configure) but copies are cheap","Relies on a clone() method — revisit the shallow vs deep copy distinction here, since it directly affects correctness","Prototype registry pattern: keep a set of pre-configured prototypes keyed by type, clone on demand","Less common in typical backend LLD rounds than Builder/Factory, but shows up in game engines, document editors (copy-paste of complex objects)"] },
    { r: 15, title: "Object Pool — reusing expensive objects (DB connections, threads)", diff: "medium", tags: ["object pool"],
      points: ["Reuses a fixed/bounded set of expensive-to-create objects instead of creating/destroying them repeatedly","Requires a clear checkout/return lifecycle — objects must be reset to a clean state before reuse","Bounded pool size forces a policy for what happens when all objects are checked out (block, grow, reject)","Real-world examples: JDBC connection pools (HikariCP), thread pools (conceptually similar even if not literally this GoF pattern)","Thread-safety is essential here — pool checkout/return must be safe under concurrent access"] },
  ],
  structural: [
    { g: "Composing objects & classes" },
    { r: 16, title: "Adapter — wrapping an incompatible interface (legacy integration)", diff: "easy",   tags: ["adapter"],
      points: ["Converts one interface into another that the client expects, without modifying either side","Object adapter (composition, wraps the adaptee) vs class adapter (inheritance, less common in Java due to single inheritance)","Classic real-world use: integrating a third-party/legacy library whose interface doesn't match your application's expected interface","Different from Facade — Adapter changes an interface to match an expected contract, Facade simplifies a complex one","Often a temporary/boundary pattern at integration points, not meant to spread through the core domain"] },
    { r: 17, title: "Decorator — adding behavior dynamically (e.g. Java I/O streams)", diff: "medium", tags: ["decorator"],
      points: ["Wraps an object to add behavior without modifying its class or affecting other instances of the same class","Each decorator implements the same interface as the component it wraps, enabling stacking (decorators wrapping decorators)","Java's I/O classes (BufferedInputStream wrapping FileInputStream wrapping ...) are the textbook real-world example","Different from inheritance-based extension — behavior is composed at runtime, and multiple decorators can combine freely","Can lead to many small wrapper classes — a real complexity cost worth naming when discussing tradeoffs"] },
    { r: 18, title: "Facade — simplifying a complex subsystem behind one interface", diff: "easy",   tags: ["facade"],
      points: ["Provides a single simplified interface to a complex set of subsystem classes/interactions","Doesn't add new functionality — purely about hiding complexity and reducing client coupling to subsystem internals","Subsystem classes remain directly accessible if a client needs finer control — Facade is a convenience layer, not a restriction","Common at service boundaries: a 'CheckoutFacade' coordinating inventory, payment, and shipping subsystems behind one call","Reduces the blast radius of subsystem changes on client code, since clients depend on the facade, not the internals"] },
    { r: 19, title: "Composite — uniform treatment of tree structures (files/folders)", diff: "medium", tags: ["composite"],
      points: ["Lets clients treat individual objects (leaves) and groups of objects (composites) through the same interface","Classic example: a FileSystemNode interface implemented by both File (leaf) and Directory (composite holding children)","Operations like getSize() or print() recurse naturally — a composite delegates to its children and aggregates","Simplifies client code dramatically — no need to special-case 'is this a leaf or a branch' at every call site","Watch for the tension with ISP — leaf nodes may be forced to implement composite-only methods (add/remove child) that don't make sense for them"] },
    { r: 20, title: "Proxy — virtual, protection, and remote proxies; relation to dynamic proxies", diff: "medium", tags: ["proxy"],
      points: ["Virtual proxy: defers expensive object creation until actually needed (e.g. Hibernate lazy-loading)","Protection proxy: adds access control checks before delegating to the real object","Remote proxy: represents an object living in a different address space (RPC stubs)","Structurally identical to Decorator, but the intent differs — Proxy controls access, Decorator adds behavior","Connects directly to Java's dynamic Proxy class and AOP frameworks discussed in the Java track — worth cross-referencing"] },
    { r: 21, title: "Bridge — decoupling abstraction from implementation (e.g. shape vs renderer)", diff: "hard",   tags: ["bridge"],
      points: ["Splits a class hierarchy into two independent hierarchies — an abstraction and an implementation — connected by composition","Classic example: Shape (Circle, Square) bridged to Renderer (VectorRenderer, RasterRenderer) so each can vary independently","Avoids a combinatorial explosion of subclasses (CircleVectorRenderer, SquareRasterRenderer, ...) that pure inheritance would create","Decided at the design stage when you expect both the abstraction AND the implementation to evolve independently over time","Often confused with Adapter — Bridge is designed upfront for independent variation, Adapter is retrofitted to reconcile existing incompatible interfaces"] },
    { r: 22, title: "Flyweight — sharing immutable state to cut memory (e.g. glyph/character objects)", diff: "medium", tags: ["flyweight"],
      points: ["Shares common immutable ('intrinsic') state across many objects, storing only the unique ('extrinsic') state per instance","Classic example: a text editor representing each character via a shared glyph object plus a per-position (x,y) coordinate","Requires a factory/registry to look up or create the shared flyweight instance rather than constructing duplicates","Tradeoff: saves memory at the cost of added complexity in separating intrinsic vs extrinsic state cleanly","Modern relevance: connection/string pooling and Java's Integer cache (-128 to 127) are flyweight-like in spirit"] },
  ],
  behavioral: [
    { g: "Communication between objects" },
    { r: 23, title: "Strategy — interchangeable algorithms at runtime (e.g. pricing rules)", diff: "easy",   tags: ["strategy"],
      points: ["Encapsulates a family of interchangeable algorithms behind a common interface, selected/injected at runtime","Classic example: a PricingStrategy interface with RegularPricing, DiscountPricing, SurgePricing implementations","Client (the context class) holds a reference to a strategy and delegates to it rather than implementing the algorithm itself","Directly satisfies OCP — adding a new algorithm means adding a new class, not editing existing logic","Closely related to dependency injection — strategies are often injected via constructor in real codebases"] },
    { r: 24, title: "Observer — pub/sub for state-change notifications",            diff: "medium", tags: ["observer"],
      points: ["Subject maintains a list of observers and notifies them on state changes, without knowing their concrete types","Push model (subject sends data with the notification) vs pull model (observer queries subject for what changed)","Java's built-in Observable/Observer is deprecated — most real systems use a custom listener interface or an event bus","Risk: memory leaks if observers register but never unregister (the subject keeps a strong reference)","Foundation for reactive programming and pub/sub messaging systems at a larger architectural scale"] },
    { r: 25, title: "State — object behavior that changes with internal state (e.g. order lifecycle)", diff: "medium", tags: ["state machine"],
      points: ["Each state is its own class implementing a common interface; the context delegates behavior to its current state object","Transitions are explicit — a state's method returns/sets the next state, making the state machine's logic traceable","Classic example: an Order with states Created → Paid → Shipped → Delivered, each restricting which transitions are valid","Avoids a large switch/if-else on a 'status' enum scattered across the codebase — encapsulates each state's rules in one place","Different from Strategy structurally (similar implementation) but different in intent — State changes its own behavior over time, Strategy is chosen externally and doesn't self-transition"] },
    { r: 26, title: "Command — encapsulating a request as an object (undo/redo, queues)", diff: "medium", tags: ["command"],
      points: ["Wraps a request (method call + arguments) as a standalone object that can be stored, queued, or passed around","Enables undo/redo by keeping a history of executed command objects, each knowing how to reverse itself","Decouples the invoker (e.g. a UI button) from the receiver (the object that actually performs the action)","Natural fit for task queues, job scheduling, and macro recording (replaying a sequence of commands)","Can combine with Memento to capture state needed for undo when the command itself doesn't have enough info to reverse cleanly"] },
    { r: 27, title: "Chain of Responsibility — request passed along a handler chain (middleware)", diff: "medium", tags: ["chain of responsibility"],
      points: ["Each handler decides to process the request, pass it to the next handler, or both","Decouples sender from receiver — the sender doesn't know which handler in the chain will ultimately deal with the request","Real-world parallel: servlet filters / HTTP middleware chains, exception handling chains, logging interceptors","Each handler holds a reference to the next handler (often via a setNext() method) forming a linked structure","Risk: a request can fall through with no handler processing it if the chain isn't terminated with a default handler"] },
    { r: 28, title: "Template Method — fixed algorithm skeleton, customizable steps", diff: "easy",   tags: ["template method"],
      points: ["Base class defines the overall algorithm structure in a final method, deferring specific steps to abstract/overridable methods","Subclasses customize only the parts that vary, while the overall sequence stays fixed and controlled by the base class","Classic example: a DataProcessor with a fixed process() method calling abstract readData(), transform(), and writeData()","Uses inheritance (unlike Strategy, which uses composition) — a real tradeoff point to mention when comparing the two","Hook methods (optional overrides with default no-op behavior) let subclasses opt into extra customization points"] },
    { r: 29, title: "Visitor — adding operations to a class hierarchy without modifying it", diff: "hard",   tags: ["visitor"],
      points: ["Separates an algorithm from the object structure it operates on — new operations are added as new Visitor implementations","Relies on double dispatch — accept(visitor) on the element calls back visitor.visit(this), resolving both types at once","Good fit when the object hierarchy is stable but the set of operations on it grows frequently — the inverse case from typical OCP usage","Adding a new element type to the hierarchy requires updating every existing Visitor implementation — a real cost to flag","Common real use: AST traversal in compilers/interpreters, where many unrelated operations (type-check, codegen, pretty-print) act on the same node hierarchy"] },
    { r: 30, title: "Mediator — centralizing complex communication between components", diff: "medium", tags: ["mediator"],
      points: ["Centralizes how a set of objects interact, so they communicate through the mediator instead of directly with each other","Reduces many-to-many coupling between components down to many-to-one coupling with the mediator","Classic example: a chat room mediator routing messages between participants who don't reference each other directly","Risk: the mediator itself can become a 'god object' if too much logic accumulates in it — needs its own internal structure as it grows","Different from Facade — Facade simplifies an existing subsystem's interface, Mediator actively coordinates interaction logic between peers"] },
    { r: 31, title: "Iterator — custom traversal without exposing internal structure", diff: "easy",   tags: ["iterator"],
      points: ["Provides a uniform way to traverse a collection's elements without exposing its internal representation (array, tree, linked list)","Java's Iterable/Iterator interfaces are the built-in realization of this pattern — hasNext()/next() abstraction","Supports multiple simultaneous, independent traversals of the same collection (each iterator holds its own position)","External iterator (client drives the loop, as in Java) vs internal iterator (collection drives, as in forEach with a lambda)","Decouples traversal algorithm from the collection's structure — you can change the underlying structure without breaking client traversal code"] },
    { r: 32, title: "Memento — capturing/restoring object state (undo history)",     diff: "medium", tags: ["memento"],
      points: ["Captures an object's internal state externally (in a Memento object) so it can be restored later, without violating encapsulation","Originator creates and restores from mementos; Caretaker stores mementos but never inspects/modifies their contents","Classic pairing with Command for implementing undo — the command stores a memento taken before it executed","Memory cost consideration: storing full state snapshots for every action can be expensive — incremental/diff-based mementos are a common optimization","In Java, often implemented via a nested static class or a serialized snapshot, kept opaque to the Caretaker"] },
  ],
  concurrency_lld: [
    { g: "Thread-safety in class design" },
    { r: 33, title: "Designing a thread-safe rate limiter (token bucket / sliding window)", diff: "hard",   tags: ["rate limiter"],
      points: ["Token bucket: tokens refill at a fixed rate up to a capacity; a request consumes a token or is rejected/delayed if none available","Sliding window counter: tracks request counts in fixed/rolling time windows to smooth out burstiness compared to fixed windows","Concurrency design choice: a single AtomicLong/synchronized counter vs a lock-free CAS-based refill calculation","Per-user/per-key rate limiting requires a concurrent map of limiter state, with its own memory growth/cleanup concerns","Be ready to discuss distributed rate limiting (shared state via Redis) as the natural next question after the single-node version"] },
    { r: 34, title: "Thread-safe Builder pattern when objects are shared across threads", diff: "medium", tags: ["builder","concurrency"],
      points: ["A Builder instance itself is typically NOT meant to be shared across threads — document and enforce single-threaded use during construction","Once build() produces an immutable object, that object is safely shareable across threads without further synchronization","If a builder must be shared (e.g. a long-lived configuration builder), synchronizing its mutator methods is one option, but usually redesigning to avoid sharing is cleaner","Defensive copying inside build() ensures the constructed object doesn't alias mutable builder-internal state that could change after build() returns","Common bug: returning a reference to a builder's internal mutable collection directly instead of a copy"] },
    { r: 35, title: "Immutable value objects as a concurrency-safety strategy",      diff: "medium", tags: ["immutability"],
      points: ["Immutable objects can be freely shared across threads with zero synchronization — there's no mutable state to race on","Functional update style (return a new instance instead of mutating) replaces locking with object creation cost — a real tradeoff to name","Final fields plus safe construction (no 'this' escaping the constructor) are required for the JMM to guarantee visibility without extra synchronization","Works especially well for message/event objects passed between threads or across a queue boundary","Doesn't eliminate all concurrency concerns — coordinating multiple immutable reads/writes (e.g. read-then-write) can still race if not handled atomically"] },
    { r: 36, title: "Designing a connection pool with bounded concurrency",          diff: "hard",   tags: ["object pool","concurrency"],
      points: ["Bounded capacity enforced via a Semaphore or a BlockingQueue of available connections","Checkout blocks (with optional timeout) when the pool is exhausted, rather than creating unbounded connections","Health-checking and eviction of stale/broken connections before handing them back out","Graceful shutdown must drain in-use connections without abruptly closing ones still mid-use","Compare to a real library's design (e.g. HikariCP) for what a production-grade version actually has to account for: leak detection, validation queries, idle timeout"] },
  ],
  machine_coding: [
    { g: "Classic 45–60 min machine coding rounds" },
    { r: 37, title: "Design a parking lot system (multi-level, vehicle types, pricing)", diff: "medium", tags: ["machine coding"],
      points: ["Core entities: ParkingLot, Level, ParkingSpot (typed by vehicle size), Vehicle, Ticket","Spot allocation strategy — nearest-available vs round-robin, and how it's modeled as a pluggable strategy","Pricing as a Strategy object (hourly, flat, per-vehicle-type) so new pricing schemes don't require editing core logic","Concurrency consideration: two vehicles can't be assigned the same spot — needs atomic spot reservation","Extension points panels probe: handling multiple entry/exit gates, reserved/handicap spots, full-lot scenarios"] },
    { r: 38, title: "Design an elevator system (multiple cars, scheduling strategy)", diff: "hard",   tags: ["machine coding"],
      points: ["Core entities: Elevator (car), Floor, Request (internal vs external call), Dispatcher/Controller","Scheduling strategy as a pluggable interface — nearest-car-first, SCAN/look algorithm, zone-based assignment","State machine per elevator: idle, moving up, moving down, door open — and how requests get queued per state","Handling simultaneous requests from multiple floors and deciding which elevator answers each","Talk through edge cases: elevator becomes unavailable mid-request, capacity limits, prioritizing existing passengers' requested floors"] },
    { r: 39, title: "Design a tic-tac-toe / chess move validator (OO board modeling)", diff: "medium", tags: ["machine coding"],
      points: ["Board as a 2D grid abstraction, independent of the specific game's rules","Piece/Player hierarchy — for chess, each piece type implements its own legal-move logic (Strategy-like)","Win/draw detection as a separate concern from move validation — keep these decoupled for testability","For chess specifically: check/checkmate detection, special moves (castling, en passant, promotion) as the depth probes","Designing the API so a CLI, GUI, or AI player can all drive the same core game engine without duplicating rules"] },
    { r: 40, title: "Design an LRU/LFU cache with O(1) operations",                  diff: "medium", tags: ["machine coding"],
      points: ["LRU: HashMap + doubly linked list, move-to-front on access, evict tail on overflow — all O(1)","LFU: HashMap of key→node plus a frequency-bucketed structure (e.g. HashMap<frequency, LinkedHashSet<key>>) to evict the least-frequently-used in O(1)","Tie-breaking within the same frequency for LFU — usually falls back to least-recently-used within that frequency bucket","Generic typing of the cache (Cache<K,V>) so it's reusable, not hardcoded to one key/value type","Thread-safety extension: how would you make this safe for concurrent get/put without serializing every operation behind one lock"] },
    { r: 41, title: "Design a library management system (books, members, holds, fines)", diff: "medium", tags: ["machine coding"],
      points: ["Core entities: Book, BookCopy (since multiple copies of the same title exist), Member, Loan, Hold/Reservation","Business rules to encode explicitly: max books per member, loan duration, fine calculation per overdue day","Hold queue handling — when a copy is returned, who gets notified next, and how that's modeled (Observer-like)","Search/catalog functionality as a separate concern from borrowing/lending workflow","Modeling fines as their own entity (not just a number) if waivers, partial payments, or history matter"] },
    { r: 42, title: "Design a splitwise / expense-sharing system (settlements, groups)", diff: "hard",   tags: ["machine coding"],
      points: ["Core entities: User, Group, Expense, Split (equal, exact amounts, percentage-based)","Balance-sheet model: maintaining a net-owed amount per user-pair, updated incrementally per expense rather than recomputed from scratch each time","Settlement/simplification algorithm — minimizing the number of transactions needed to settle all debts within a group (graph-based optimization)","Split strategy as a pluggable interface so equal/exact/percentage splits don't require branching logic everywhere","Edge cases: a user leaving a group with outstanding balances, currency handling, rounding errors in percentage splits"] },
    { r: 43, title: "Design a ride-hailing matching system (drivers, riders, pricing)", diff: "hard",   tags: ["machine coding"],
      points: ["Core entities: Rider, Driver, Ride, Location, PricingStrategy","Matching strategy — nearest available driver vs a scoring function (ETA, driver rating, surge zone) as a pluggable Strategy","Driver state machine: available, en route to pickup, on trip, offline — and valid transitions between them","Pricing as Strategy/Decorator-composable rules: base fare + surge multiplier + distance/time component","In-memory spatial indexing consideration (grid-based or geohash) for efficiently finding nearby drivers — ties into the System Design track's geo-indexing topic"] },
    { r: 44, title: "Design a vending machine (state machine for inventory + payment)", diff: "medium", tags: ["machine coding","state pattern"],
      points: ["Classic State pattern application: Idle, HasMoney, Dispensing, OutOfStock states with explicit transitions","Inventory modeled per-slot with quantity tracking, decremented atomically on successful dispense","Payment handling — accepting partial payment, returning change, rejecting insufficient payment — all as explicit states/transitions","Refund/cancel flow as a transition available from multiple states, not just a happy-path linear flow","Extension probe: adding a new payment method (card, mobile) without rewriting the core state machine"] },
    { r: 45, title: "Design a logging framework (levels, appenders, formatters)",   diff: "medium", tags: ["machine coding"],
      points: ["Core entities: Logger, LogLevel (with ordering/filtering), Appender (console, file, network), Formatter","Appenders as a Strategy/Decorator-composable list — a single log call can fan out to multiple appenders","Asynchronous logging consideration — a queue + background thread to avoid blocking the calling thread on slow I/O appenders","Configurability: per-package or per-class log level overrides, similar to how log4j/SLF4J actually work","Formatter as its own pluggable component so the same log event can render differently per appender (JSON for files, plain text for console)"] },
    { r: 46, title: "Design an in-memory pub/sub or event bus",                      diff: "medium", tags: ["machine coding","observer"],
      points: ["Core entities: EventBus, Topic/EventType, Publisher, Subscriber — built on the Observer pattern fundamentally","Synchronous vs asynchronous dispatch — calling subscribers directly vs handing events off to a thread pool/queue","Subscriber registration/unregistration lifecycle, and avoiding memory leaks from subscribers that never unregister","Wildcard or hierarchical topic matching if the design calls for it (e.g. 'orders.*' subscribing to all order sub-events)","Error isolation: one failing subscriber shouldn't prevent others from receiving the event"] },
    { r: 47, title: "Design a notification system (multi-channel: email/SMS/push, templating)", diff: "medium", tags: ["machine coding"],
      points: ["Core entities: Notification, Channel (Email, SMS, Push as Strategy implementations), Template, User preferences","Channel abstraction lets new delivery methods be added without touching the core notification dispatch logic","Template rendering as its own concern, separate from channel delivery — supports per-channel format differences (HTML email vs plain SMS text)","Retry/fallback logic — if push fails, fall back to email; modeled as a Chain of Responsibility or explicit fallback strategy","User preference and rate-limiting/throttling considerations (don't spam a user across channels for the same event)"] },
    { r: 48, title: "Design a movie ticket booking system (seat locking, concurrency)", diff: "hard",   tags: ["machine coding","concurrency"],
      points: ["Core entities: Show, Seat, Booking, Theater/Screen layout","Seat locking strategy to prevent double-booking — pessimistic locking (DB row lock) vs optimistic locking (version check) vs a short-lived in-memory hold/TTL","Booking state machine: held (temporary, expires), confirmed (after payment), released (timeout/cancellation)","Concurrency hotspot: many users trying to book the same popular show simultaneously — needs to be discussed explicitly, not hand-waved","Payment integration boundary — booking confirmation should be atomic with payment success, raising the saga/2-phase-commit discussion from the System Design track"] },
    { r: 49, title: "Design a file system (directories, files, permissions) in memory", diff: "hard",   tags: ["machine coding","composite"],
      points: ["Composite pattern application: a common Node interface implemented by both File (leaf) and Directory (composite)","Path resolution logic (absolute vs relative paths, '..' handling) as its own component, separate from the node tree itself","Permission model — read/write/execute per user/group, and how permission checks propagate (or don't) from parent directories","Operations to support explicitly: create, delete, move/rename, recursive size calculation, search by name/pattern","Concurrency consideration if multiple operations can run simultaneously (e.g. deleting a directory while another thread reads from it)"] },
    { r: 50, title: "Design a circuit breaker / retry mechanism for service calls",  diff: "hard",   tags: ["machine coding","resilience"],
      points: ["States: Closed (normal), Open (failing fast, not calling downstream), Half-Open (testing if downstream recovered) — a State pattern application","Failure threshold and time-window configuration for transitioning Closed → Open (e.g. 50% failure rate over the last 20 calls)","Retry policy as its own component — fixed delay, exponential backoff, backoff with jitter — pluggable independently of the circuit breaker logic","Half-Open behavior: allowing a limited number of trial requests through before deciding to fully close or re-open","Composition with timeouts and bulkheads (limiting concurrent calls to a dependency) for a complete resilience story, referencing the System Design reliability topics"] },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   SYSTEM DESIGN TRACK — HLD building blocks + classic case studies
   ════════════════════════════════════════════════════════════════════ */
const HLD_TOPICS = [
  { id: "fundamentals", label: "Core Building Blocks", icon: "▢" },
  { id: "scalability",  label: "Scalability & Performance", icon: "↗" },
  { id: "data",         label: "Databases & Storage", icon: "⛁" },
  { id: "messaging",    label: "Messaging & Streaming", icon: "≈" },
  { id: "reliability",  label: "Reliability & Resilience", icon: "⛨" },
  { id: "distributed",  label: "Distributed Systems Theory", icon: "◈" },
  { id: "case_studies", label: "Case Studies / Design Rounds", icon: "✎" },
];

const HLD_DATA = {
  fundamentals: [
    { g: "Networking & APIs" },
    { r: 1, title: "Load balancers — L4 vs L7, algorithms (round robin, least conn, consistent hashing)", diff: "medium", tags: ["load balancing"],
      points: ["L4 (transport layer) balances on IP/port without inspecting content — fast, protocol-agnostic","L7 (application layer) can route on URL path, headers, cookies — enables smarter routing but costs more CPU/latency","Round robin (simple, ignores load), least-connections (load-aware), weighted variants for heterogeneous server capacity","Consistent hashing for sticky routing (same client/key → same backend) — minimizes remapping when servers are added/removed","Health checks integrated into the load balancer to pull unhealthy instances out of rotation automatically","Active-active vs active-passive load balancer deployment for the LB tier's own high availability"] },
    { r: 2, title: "DNS resolution & CDN — edge caching, geo-routing, cache invalidation", diff: "medium", tags: ["CDN","DNS"],
      points: ["DNS resolution chain: recursive resolver → root → TLD → authoritative server, with caching (TTL) at each hop","GeoDNS/Anycast routing directs users to the nearest edge location based on origin IP","CDN edge caching for static assets — cache-control headers, TTL strategy, and stale-while-revalidate patterns","Cache invalidation at the CDN layer is hard — purge APIs, versioned URLs (cache-busting), or short TTLs as different strategies","Origin shield pattern to protect the origin server from cache-miss stampedes across many edge locations","Dynamic content acceleration (CDN intelligently routing even non-cacheable requests over optimized backbone paths)"] },
    { r: 3, title: "REST vs gRPC vs GraphQL — tradeoffs for internal vs external APIs", diff: "medium", tags: ["API styles"],
      points: ["REST: simple, cacheable, human-readable, widely understood — but can mean over-fetching/under-fetching data","gRPC: binary protobuf, HTTP/2 multiplexing, strongly-typed contracts, much faster — but harder to debug/inspect, less browser-native","GraphQL: client specifies exactly the fields needed, solves over-fetching — but adds query complexity/cost analysis concerns on the server","Internal service-to-service calls often favor gRPC for performance and strict contracts via .proto files","Public-facing APIs often favor REST for ecosystem compatibility, or GraphQL when clients have highly variable data needs","Versioning strategy differs per style — REST URL/header versioning, gRPC field deprecation in proto, GraphQL schema evolution via additive fields"] },
    { r: 4, title: "API Gateway — auth, rate limiting, request routing at the edge", diff: "medium", tags: ["API gateway"],
      points: ["Single entry point for authentication, authorization, rate limiting, and routing to backend microservices","Offloads cross-cutting concerns (auth, logging, throttling) from individual services so they don't reimplement it each","Request transformation/aggregation — combining multiple backend calls into one client-facing response (Backend-for-Frontend pattern)","Becomes a single point of failure/bottleneck if not scaled and made highly available itself","Service discovery integration — gateway needs to know which backend instances are currently healthy to route to"] },
    { g: "Caching" },
    { r: 5, title: "Cache strategies — write-through, write-back, write-around, cache-aside", diff: "medium", tags: ["caching"],
      points: ["Cache-aside: app checks cache first, on miss reads from DB and populates cache — most common pattern, app controls caching logic explicitly","Write-through: writes go to cache and DB synchronously — keeps cache consistent but adds write latency","Write-back: writes go to cache first, flushed to DB asynchronously later — fast writes, but risk of data loss on cache failure before flush","Write-around: writes go directly to DB, bypassing cache — avoids polluting cache with data that may not be read again soon","Choosing the right one depends on read/write ratio and how much staleness/data-loss risk the use case can tolerate"] },
    { r: 6, title: "Cache eviction — LRU/LFU at scale, thundering herd & cache stampede mitigation", diff: "hard",   tags: ["caching"],
      points: ["LRU/LFU as eviction policies — but at scale, approximations (e.g. Redis's sampled LRU) are used instead of exact tracking for performance","Thundering herd / cache stampede: many requests simultaneously miss on the same hot key (e.g. right after expiry) and all hit the DB at once","Mitigation: request coalescing (only one request fetches, others wait), probabilistic early expiration, or a 'lock' key while refreshing","Stale-while-revalidate: serve slightly stale data while asynchronously refreshing, instead of blocking on a fresh fetch","Negative caching (caching the 'not found' result) to avoid repeated DB hits for keys that don't exist"] },
    { r: 7, title: "Multi-level caching — browser → CDN → app cache → DB cache",  diff: "medium", tags: ["caching"],
      points: ["Each layer has different latency, scope, and invalidation difficulty — browser (per-user, fastest, hardest to invalidate centrally) down to DB cache (shared, slower, easiest to control)","Cache coherence across layers — invalidating a CDN cache doesn't automatically invalidate a downstream app-level cache","Local (in-process) cache vs distributed cache (Redis/Memcached) tradeoff — local is faster but inconsistent across instances","Read-through hierarchy: a miss at one layer cascades to the next, populating caches on the way back up","Designing TTLs per layer deliberately — shorter near the user for freshness, longer near the DB for load protection"] },
    { g: "Estimation & capacity" },
    { r: 8, title: "Back-of-envelope estimation — QPS, storage, bandwidth math for a design round", diff: "medium", tags: ["estimation"],
      points: ["Daily active users → average QPS → peak QPS (commonly 2-3x average for a rough peak factor)","Storage estimation: per-record size × records per day × retention period, then accounting for replication factor","Bandwidth: requests/sec × average payload size, separately for read and write paths","Read:write ratio drives architecture choices — a 100:1 read-heavy system pushes hard toward caching/read replicas","State your assumptions out loud during the estimation — interviewers care more about the reasoning process than the exact final number"] },
  ],
  scalability: [
    { g: "Scaling strategies" },
    { r: 9, title: "Horizontal vs vertical scaling — statelessness as the enabler", diff: "easy",   tags: ["scaling"],
      points: ["Vertical scaling (bigger machine) has a hard ceiling and a single point of failure; horizontal scaling (more machines) doesn't, but requires statelessness","Stateless services let any instance handle any request — session state must live externally (Redis, DB, client-side token) rather than in-process","Sticky sessions are a stopgap that reintroduces some state-affinity problems horizontal scaling is meant to solve","Auto-scaling groups react to load (CPU, queue depth, custom metrics) to add/remove instances dynamically","Vertical scaling is sometimes still the right first move for simplicity, before the complexity of horizontal scaling is justified by actual load"] },
    { r: 10, title: "Database read replicas & replication lag handling",          diff: "medium", tags: ["replication"],
      points: ["Read replicas offload read traffic from the primary, which still handles all writes","Replication lag means a replica can serve stale data briefly after a write — a real consistency tradeoff to name explicitly","Read-your-own-writes problem: a user who just wrote shouldn't read a stale replica and see their own change missing","Mitigations: route a user's own reads to the primary briefly after they write, or use a 'read your writes' session-sticky strategy","Synchronous vs asynchronous replication — sync guarantees no lag but adds write latency and can block on a slow replica"] },
    { r: 11, title: "Sharding strategies — range, hash, directory-based; resharding pain", diff: "hard",   tags: ["sharding"],
      points: ["Range-based sharding (e.g. by user ID range) is simple but can create hot shards if access patterns aren't uniform","Hash-based sharding distributes load more evenly but makes range queries across shards expensive","Directory-based sharding uses a lookup service mapping keys to shards — flexible but adds a dependency and potential bottleneck","Resharding (adding/removing shards) is expensive — consistent hashing or virtual nodes minimize the fraction of keys that must move","Cross-shard queries/joins and cross-shard transactions are significantly harder — often pushed to the application layer or avoided by design"] },
    { r: 12, title: "Rate limiting algorithms — token bucket, leaky bucket, sliding window counter", diff: "medium", tags: ["rate limiting"],
      points: ["Fixed window counter: simple, but allows a burst of 2x the limit right at the window boundary","Sliding window log: precise, but memory-expensive (stores every request timestamp)","Sliding window counter: approximates sliding log with much less memory by weighting the previous window's count","Token bucket: allows controlled bursts up to the bucket capacity while enforcing a steady average rate","Leaky bucket: smooths bursts into a constant output rate, useful when downstream truly needs a steady pace, not just an average cap"] },
    { g: "Async & decoupling" },
    { r: 13, title: "Moving sync work to async — when a queue belongs in the design", diff: "medium", tags: ["async patterns"],
      points: ["Good candidates: work that's slow, can tolerate eventual completion, or shouldn't block the user-facing request (emails, image processing, analytics)","Decouples producer and consumer scaling — they can scale independently based on their own load characteristics","Introduces eventual consistency between the triggering action and its downstream effects — must be communicated to the user/UI appropriately","Failure handling shifts from 'synchronous error response' to retry queues, dead-letter queues, and monitoring for stuck messages","Don't queue everything reflexively — synchronous calls are simpler to reason about and debug when latency budgets allow it"] },
    { r: 14, title: "Backpressure — handling producers faster than consumers",     diff: "hard",   tags: ["backpressure"],
      points: ["Without backpressure, a fast producer can overwhelm a slow consumer's queue/buffer until it runs out of memory","Bounded queues with a rejection or blocking policy are the simplest backpressure mechanism — force the producer to slow down or drop","Reactive Streams-style explicit backpressure protocols let the consumer signal how much it can handle (pull-based demand)","Load shedding: intentionally dropping lower-priority work under overload rather than letting everything degrade together","Autoscaling the consumer side is a complementary (not alternative) strategy — it has lag, so backpressure is still needed for the gap"] },
    { r: 15, title: "Hot key / hot partition problems and mitigation",            diff: "hard",   tags: ["hotspots"],
      points: ["A single very popular key (celebrity user, viral post) can overwhelm the one shard/partition/cache node responsible for it, regardless of overall cluster capacity","Mitigation: key splitting — append a random suffix to spread a hot key's writes across multiple sub-keys, aggregate on read","Local in-memory caching of hot keys at the application layer to absorb load before it even reaches the sharded store","Read replicas specifically for hot data, separate from the general replication strategy","Detecting hot keys in production (via access pattern monitoring) before they cause an incident, not just reactively"] },
  ],
  data: [
    { g: "Choosing the right store" },
    { r: 16, title: "SQL vs NoSQL — when consistency/joins beat horizontal scale (and vice versa)", diff: "medium", tags: ["data modeling"],
      points: ["SQL: strong consistency, ACID transactions, joins — fits domains with complex relationships and correctness-critical data (financial ledgers)","NoSQL: typically trades some consistency/join capability for easier horizontal scaling and flexible schema","Document stores (MongoDB) fit nested, evolving schemas; this isn't 'NoSQL = no schema', just schema-on-read instead of schema-on-write","The real decision driver is access pattern and consistency requirement, not 'scale' as a vague buzzword — many SQL databases scale to massive size","NewSQL (e.g. Spanner, CockroachDB) blurs the line by offering horizontal scale with SQL semantics and stronger consistency than typical NoSQL"] },
    { r: 17, title: "Key-value, document, columnar, graph, time-series — matching store to access pattern", diff: "medium", tags: ["storage types"],
      points: ["Key-value (Redis, DynamoDB): simplest model, fastest for direct lookups, weakest for complex queries","Document (MongoDB): good for nested, semi-structured records accessed mostly as whole objects","Columnar (Cassandra, BigQuery): excellent for analytical aggregation over specific columns across huge datasets","Graph (Neo4j): models highly connected data (social graphs, recommendation engines) where relationship traversal is the dominant query","Time-series (InfluxDB, TimescaleDB): optimized for append-heavy, timestamp-indexed data with retention/downsampling built in"] },
    { r: 18, title: "Indexing — B-tree vs LSM-tree, write-amplification tradeoffs", diff: "hard",   tags: ["indexing"],
      points: ["B-tree: balanced read/write performance, in-place updates — the default for traditional relational databases","LSM-tree (log-structured merge-tree): writes are append-only and fast (sequential I/O), reads may need to check multiple levels — used by Cassandra, RocksDB, LevelDB","Write amplification in LSM-trees from compaction — data gets rewritten multiple times as it merges across levels","B-trees suffer write amplification differently — random-access page writes and the need to keep pages balanced","Choosing between them is a read-heavy vs write-heavy workload decision at its core, not just 'which is newer'"] },
    { g: "Scaling data" },
    { r: 19, title: "Database partitioning vs replication — combining both correctly", diff: "hard",   tags: ["partitioning"],
      points: ["Partitioning (sharding) splits data across nodes for write/storage scale; replication copies the same data for read scale and durability","Each shard typically has its own replica set — the two techniques compose, they don't substitute for each other","Replica placement strategy matters for availability — replicas of the same shard across different failure domains (racks/AZs)","Rebalancing partitions while maintaining replication invariants (each shard still has enough healthy replicas) adds real operational complexity","Quorum-based reads/writes (discussed in distributed systems theory) often layer on top of this partition+replica structure"] },
    { r: 20, title: "Handling schema migrations at scale with zero downtime",     diff: "medium", tags: ["migrations"],
      points: ["Backward/forward-compatible migration pattern: add new column (nullable/default) → deploy code that writes both old+new → backfill → deploy code reading only new → drop old column","Never deploy a schema change and a code change that depends on it in the same release — sequence them across separate, safe deploys","Large table migrations (adding an index, altering a column type) can lock or heavily load the table — often done online/in batches via tools instead of one big ALTER","Feature flags to control rollout of code paths depending on the new schema, decoupled from the deploy itself","Always have a rollback plan for the migration itself, not just for the application code"] },
    { r: 21, title: "Search at scale — inverted index basics, when to bolt on Elasticsearch", diff: "medium", tags: ["search"],
      points: ["Inverted index maps each term to the list of documents containing it — the foundational data structure behind full-text search","Relational LIKE '%term%' queries don't scale for full-text search — no index can help with leading wildcards","Elasticsearch/Solr layered alongside the primary DB (not replacing it) — primary DB stays source of truth, search index is a derived, eventually-consistent view","Keeping the search index in sync — typically via CDC or an event stream from the primary DB, not dual writes from the application","Relevance ranking (TF-IDF, BM25) and faceted search are the features that justify the operational cost of running a dedicated search engine"] },
    { g: "Consistency mechanics" },
    { r: 22, title: "Strong vs eventual consistency — picking per use case, not globally", diff: "hard",   tags: ["consistency"],
      points: ["Strong consistency: every read sees the latest write immediately — necessary for things like account balances, inventory counts at checkout","Eventual consistency: reads may briefly see stale data, but the system converges — acceptable for likes counts, view counts, social feeds","A single system often mixes both — strongly consistent for the payment path, eventually consistent for the activity feed, in the same product","Read-your-writes, monotonic reads, and causal consistency are middle-ground models between strict and eventual — worth naming as nuance beyond the binary framing","The consistency choice should be justified by the specific business requirement of that data, not applied uniformly across an entire system"] },
    { r: 23, title: "Distributed transactions — 2-phase commit vs Saga pattern",  diff: "hard",   tags: ["transactions"],
      points: ["2-phase commit (2PC): a coordinator asks all participants to prepare, then commits only if all agree — strong consistency but blocking, and a coordinator failure can leave participants stuck","Saga pattern: breaks a distributed transaction into a sequence of local transactions, each with a compensating action to undo it if a later step fails","Choreography-based saga: each service reacts to events and publishes its own — no central coordinator, but harder to trace the overall flow","Orchestration-based saga: a central orchestrator explicitly sequences each step — easier to reason about and debug, but the orchestrator becomes a key dependency","Sagas trade strict atomicity for availability/scalability — intermediate inconsistent states are visible to the system, which must be tolerable for the use case"] },
  ],
  messaging: [
    { g: "Queues & pub/sub" },
    { r: 24, title: "Message queues — Kafka vs RabbitMQ vs SQS, ordering & delivery guarantees", diff: "hard",   tags: ["queues"],
      points: [
        "Kafka: log-based, partitioned, messages retained for a configurable period regardless of consumption — consumers track their own offset, so multiple consumer groups can replay independently",
        "RabbitMQ: traditional broker with queues/exchanges, messages are typically removed once acknowledged — strong routing flexibility via exchange types (direct, topic, fanout, headers)",
        "SQS: fully-managed, simple queue semantics, naturally horizontally scalable — Standard queues are at-least-once with best-effort ordering, FIFO queues add strict ordering at lower throughput",
        "Ordering guarantee comparison: Kafka guarantees order only within a partition (not across partitions); RabbitMQ classic queues are FIFO per queue; SQS Standard has no ordering guarantee, FIFO queues do",
        "Throughput comparison: Kafka is built for very high-throughput streaming (millions of events/sec); RabbitMQ excels at complex routing at moderate throughput; SQS trades raw throughput for zero operational overhead",
        "Consumer model differences: Kafka consumer groups each maintain independent offsets (pull-based, replayable); RabbitMQ pushes to consumers and removes on ack (not replayable by default); SQS is poll-based with visibility timeouts instead of partitions",
        "Delivery guarantee defaults differ per system — none of the three give exactly-once 'for free' end-to-end; it has to be engineered (see idempotency topic) regardless of which broker you pick",
        "Persistence & replay: Kafka's log retention enables replaying historical events for new consumers/backfills; RabbitMQ/SQS are designed around 'consume and discard', not long-term replay",
        "Operational tradeoff: Kafka requires more operational expertise to run well (partition rebalancing, ZooKeeper/KRaft); SQS requires none (fully managed); RabbitMQ sits in between",
        "When to pick which: Kafka for event streaming/event sourcing/high-throughput pipelines; RabbitMQ for complex task routing and RPC-style messaging; SQS for simple, low-ops decoupling within AWS-centric systems",
      ] },
    { r: 25, title: "At-most-once / at-least-once / exactly-once semantics in practice", diff: "hard",   tags: ["delivery guarantees"],
      points: ["At-most-once: message may be lost but is never duplicated — fire-and-forget, acceptable for non-critical telemetry","At-least-once: message is never lost but may be delivered more than once — the most common real-world default, requires idempotent consumers","Exactly-once is extremely hard to achieve truly end-to-end — most 'exactly-once' systems actually provide at-least-once delivery plus idempotent processing, achieving an exactly-once effect","Kafka's transactional/exactly-once semantics work within the Kafka ecosystem (producer to topic to consumer) but break down once you cross into external side effects (e.g. calling a non-transactional API)","Acknowledge-after-process vs acknowledge-before-process ordering determines whether a crash causes message loss or duplication — a critical, often-overlooked detail"] },
    { r: 26, title: "Idempotency — designing consumers safe against duplicate delivery", diff: "medium", tags: ["idempotency"],
      points: ["Idempotency key (a unique ID per logical operation) stored alongside the result, so reprocessing the same key returns the cached outcome instead of redoing the side effect","Natural idempotency for some operations (e.g. 'set status to X') vs operations that need explicit dedup (e.g. 'increment balance by X')","Database unique constraints as a simple, robust idempotency enforcement mechanism (e.g. unique constraint on (orderId, eventType))","Idempotency window/TTL — how long you keep dedup records before it's safe to assume a duplicate won't show up that late","Distinguish idempotency (safe to repeat) from deduplication (detecting and dropping repeats) — related but not identical concepts"] },
    { g: "Streaming" },
    { r: 27, title: "Kafka internals — partitions, consumer groups, offset management", diff: "hard",   tags: ["Kafka"],
      points: ["A topic is split into partitions; each partition is an ordered, append-only log assigned to a leader broker (with follower replicas)","Producers can control partition assignment via a key (same key → same partition → preserves order for that key)","Consumer groups: each partition is consumed by exactly one consumer within a group, enabling parallel consumption while avoiding duplicate processing within the group","Offsets track each consumer group's position per partition — committed periodically (auto or manual) so a restart resumes near where it left off","Replication factor and the in-sync replica (ISR) set determine durability — acks=all waits for all ISR members to acknowledge a write before considering it committed","Rebalancing (when a consumer joins/leaves a group) pauses consumption briefly while partitions are reassigned — a real latency spike to account for"] },
    { r: 28, title: "Event-driven architecture — choreography vs orchestration",  diff: "medium", tags: ["event-driven"],
      points: ["Choreography: each service publishes events and reacts to others' events independently — no central coordinator, naturally decoupled but harder to trace end-to-end flow","Orchestration: a central service explicitly directs the sequence of steps and calls other services — easier to reason about and debug, but reintroduces a coordinating dependency","Event sourcing as a related but distinct concept — storing state as a sequence of events rather than just the current snapshot, enabling replay and audit","Schema evolution for events is a long-term concern — consumers must tolerate new optional fields without breaking (similar to API versioning)","Choosing between them often comes down to how many services participate and how critical end-to-end visibility/debuggability is for that workflow"] },
    { r: 29, title: "Change Data Capture (CDC) — syncing services off a DB without dual writes", diff: "hard",   tags: ["CDC"],
      points: ["CDC reads the database's transaction/write-ahead log directly to capture every change, without the application code having to explicitly emit events","Avoids the 'dual write' problem — writing to the DB and publishing an event in two separate non-atomic operations risks them getting out of sync if one fails","Tools like Debezium tail the DB log and publish change events to a stream (commonly Kafka) for downstream consumers","Enables keeping a search index, cache, or analytics store in sync with the source-of-truth DB without modifying application write paths","Adds operational complexity (running and monitoring the CDC pipeline itself) and a small propagation delay before downstream consumers see a change"] },
  ],
  reliability: [
    { g: "Failure handling" },
    { r: 30, title: "Circuit breaker, retries with backoff & jitter, bulkheads",  diff: "medium", tags: ["resilience patterns"],
      points: ["Circuit breaker: stops calling a failing dependency after a failure threshold, failing fast instead of piling up slow/failing requests","Exponential backoff with jitter: spacing out retries increasingly, with randomization to avoid synchronized retry storms across many clients","Bulkhead pattern: isolating resources (thread pools, connection pools) per dependency so one failing dependency can't exhaust resources needed by others","Retry budgets — capping total retry attempts system-wide, not just per-request, to avoid amplifying load during an outage","Combining all three: bulkhead isolates blast radius, circuit breaker stops calling a known-bad dependency, backoff/jitter spaces out recovery attempts"] },
    { r: 31, title: "Designing for graceful degradation under partial outages",   diff: "medium", tags: ["degradation"],
      points: ["Identify which features are 'core' (must work) vs 'enhancing' (can be temporarily disabled) before an outage happens, not during one","Serving cached/stale data instead of an error when a downstream dependency is unavailable, where staleness is acceptable","Feature flags to manually or automatically disable non-critical functionality under load/partial failure","Default/fallback values (e.g. showing a generic recommendation when the personalization service is down) instead of a blank or broken page","Graceful degradation requires the dependency to be optional by design — retrofitting it after a hard dependency exists is much harder"] },
    { r: 32, title: "Health checks, readiness vs liveness probes",                diff: "easy",   tags: ["health checks"],
      points: ["Liveness probe: 'is the process alive/responsive at all' — failing this typically triggers a restart","Readiness probe: 'is this instance ready to receive traffic right now' — failing this removes it from load balancer rotation without restarting it","Conflating the two is a common mistake — a temporarily overloaded instance should fail readiness (stop receiving new traffic) without being killed by a liveness failure","Deep health checks (verifying downstream DB/cache connectivity) vs shallow checks (just 'process is running') — deep checks risk cascading failures if the dependency itself is degraded","Startup probes (Kubernetes) to give slow-starting applications time before liveness checks begin, avoiding restart loops during normal startup"] },
    { g: "Operating at scale" },
    { r: 33, title: "Observability — metrics, logs, traces; the three pillars in a design answer", diff: "medium", tags: ["observability"],
      points: ["Metrics: aggregated numeric time-series (latency percentiles, error rate, throughput) — cheap to store, good for dashboards/alerting","Logs: detailed, per-event records — expensive at scale, best for deep debugging a specific incident after metrics/traces point you there","Traces: follow a single request across multiple services, showing where time was spent — essential for diagnosing latency in a microservices architecture","Correlation IDs propagated across service calls tie logs/traces/metrics for the same request together","In a design interview, mentioning observability unprompted as part of the design (not just when asked) signals production-readiness thinking"] },
    { r: 34, title: "SLA / SLO / SLI — defining and designing around them",      diff: "medium", tags: ["SLAs"],
      points: ["SLI (Service Level Indicator): the actual measured metric, e.g. 'p99 latency' or 'success rate'","SLO (Service Level Objective): the internal target for that indicator, e.g. '99.9% of requests succeed'","SLA (Service Level Agreement): the external, often contractual commitment to customers, usually looser than the internal SLO to leave margin","Error budget: the SLO's allowed failure rate spent deliberately (e.g. on risky deploys) rather than treated as pure waste to eliminate","Designing redundancy/retries/timeouts should be explicitly tied back to the SLO target, not added arbitrarily"] },
    { r: 35, title: "Disaster recovery — RTO/RPO, multi-region active-active vs active-passive", diff: "hard",   tags: ["disaster recovery"],
      points: ["RTO (Recovery Time Objective): how long you're down before recovery — drives how automated/fast your failover needs to be","RPO (Recovery Point Objective): how much data you can afford to lose — drives replication frequency/synchronicity","Active-passive: one region serves traffic, the other stands by — simpler, cheaper, but failover has some delay and the passive region's capacity sits mostly idle","Active-active: multiple regions serve traffic simultaneously — better resource utilization and faster failover, but requires solving multi-region data consistency/conflict resolution","Regular failover drills (not just documentation) are what actually validates an RTO/RPO target is achievable, not theoretical"] },
    { r: 36, title: "Chaos engineering — proactively validating failure assumptions", diff: "medium", tags: ["chaos engineering"],
      points: ["Deliberately injecting failures (killing instances, adding network latency, dropping packets) in a controlled way to validate the system actually handles them as designed","Tools like Chaos Monkey randomly terminate instances in production to ensure redundancy assumptions are continuously tested, not just true on paper","Start in staging/lower environments before production, and always have a clear blast-radius limit and rollback plan for the experiment itself","Game days — scheduled team exercises simulating an outage to test both system resilience and team response/runbooks together","The goal is finding weaknesses before a real incident does, turning 'we think this is resilient' into 'we've verified this is resilient'"] },
  ],
  distributed: [
    { g: "Theory that grounds your design choices" },
    { r: 37, title: "CAP theorem — what it actually constrains (and commonly misstates)", diff: "hard",   tags: ["CAP"],
      points: ["States that during a network partition, a system must choose between Consistency and Availability — it does not say you can never have both absent a partition","Common misstatement: 'pick 2 of 3 always' — in reality, partition tolerance is a given for any distributed system, so the real choice is C vs A specifically during a partition","Most real systems are not purely CP or AP everywhere — different operations within the same system can make different choices (e.g. strongly consistent writes, eventually consistent reads)","CAP says nothing about latency, which is often the more practically relevant tradeoff in normal (non-partitioned) operation — this is what PACELC addresses","Citing CAP correctly in an interview (acknowledging the partition-specific framing) signals deeper understanding than the textbook 'pick two' answer"] },
    { r: 38, title: "PACELC — extending CAP with the latency/consistency tradeoff", diff: "hard",   tags: ["PACELC"],
      points: ["PACELC: if Partition, choose Availability or Consistency (the CAP part); Else (normal operation), choose Latency or Consistency","Addresses CAP's blind spot — even without a partition, there's a real tradeoff between strict consistency (often requiring more coordination/latency) and lower latency (allowing some staleness)","Systems like DynamoDB are PA/EL (available + low-latency, eventually consistent both during and outside partitions)","Systems like traditional synchronously-replicated SQL are PC/EC (consistent in both cases, at the cost of availability/latency)","Useful framing for justifying a specific database choice in a design interview beyond just citing CAP"] },
    { r: 39, title: "Consistent hashing — ring design, virtual nodes, rebalancing cost", diff: "hard",   tags: ["consistent hashing"],
      points: ["Maps both nodes and keys onto a hash ring; a key belongs to the first node clockwise from its hash position","Adding/removing a node only remaps the keys between it and its neighbor on the ring — not the entire keyspace, unlike naive modulo hashing","Virtual nodes: each physical node owns multiple positions on the ring, improving load distribution and making rebalancing more granular","Hot spot risk without virtual nodes — uneven ring distribution can overload one physical node disproportionately","Used in Dynamo-style databases, distributed caches (memcached client-side hashing), and CDN request routing"] },
    { r: 40, title: "Quorum reads/writes — tunable consistency (e.g. Dynamo-style N/W/R)", diff: "hard",   tags: ["quorum"],
      points: ["N = total replicas, W = replicas that must acknowledge a write, R = replicas that must respond to a read","W + R > N guarantees read-your-write consistency (the read and write sets must overlap by at least one replica)","Tuning W and R lets you trade consistency for latency/availability per operation — e.g. W=1 for fast writes vs W=N for strict durability","Sloppy quorum (writing to the next N healthy nodes if some are down) trades strict correctness for availability during partial failures","Read-repair and hinted handoff as complementary mechanisms for reconciling replicas that missed a write"] },
    { r: 41, title: "Vector clocks & conflict resolution in multi-master replication", diff: "hard",   tags: ["conflict resolution"],
      points: ["Vector clocks track causality (which writes happened before others) across multiple replicas, without relying on synchronized wall-clock time","Detect concurrent (conflicting) writes — two updates neither of which 'happened before' the other — that simple timestamps can't reliably distinguish","Conflict resolution strategies once detected: last-write-wins (simple but can silently lose data), application-level merge (e.g. CRDTs), or surfacing the conflict to the client","CRDTs (Conflict-free Replicated Data Types) as a more modern approach — data structures designed so concurrent updates merge deterministically without explicit conflict resolution logic","Multi-master replication's core tension: allowing writes anywhere for availability/latency necessarily means conflicts can happen and must be handled somehow"] },
    { r: 42, title: "Leader election & consensus — Raft/Paxos at a conceptual level", diff: "hard",   tags: ["consensus"],
      points: ["Consensus algorithms let a cluster agree on a single value/decision (e.g. who's the leader) even with node failures, as long as a majority are alive and reachable","Raft: easier to understand/implement than Paxos — explicit leader election with terms, log replication from leader to followers, majority commit","Paxos: the original, more abstract algorithm — proven correct but notoriously harder to reason about and implement correctly","Leader election ensures only one node coordinates writes at a time, avoiding split-brain — critical for systems like ZooKeeper, etcd, Kafka's controller","Quorum-based commit (majority must acknowledge) is what allows consensus systems to tolerate a minority of node failures without losing agreed-upon state"] },
    { r: 43, title: "Distributed locks — correctness pitfalls (e.g. naive Redis locks)", diff: "hard",   tags: ["distributed locks"],
      points: ["A naive SETNX-based Redis lock can fail if the lock-holder crashes without releasing it — requires a TTL/expiry as a safety net","TTL introduces its own risk: if the holder's work takes longer than the TTL, another client can acquire the lock while the first still thinks it holds it ('split brain' on the resource being protected)","Fencing tokens (a monotonically increasing token issued with each lock acquisition) let the protected resource reject stale operations from a client that lost the lock without realizing it","Redlock (multi-Redis-instance locking algorithm) is a proposed fix, but has been the subject of real, credible correctness critiques — worth knowing this nuance exists, not just the happy-path description","For genuinely critical correctness needs, a consensus-based system (e.g. etcd/ZooKeeper locks) is generally a safer foundation than a single Redis instance"] },
    { r: 44, title: "Clock synchronization — why distributed systems avoid relying on wall-clock order", diff: "medium", tags: ["clocks"],
      points: ["Wall clocks across machines drift and aren't perfectly synchronized even with NTP — 'who wrote first' can't be reliably determined by comparing timestamps from different machines","Logical clocks (Lamport timestamps, vector clocks) capture causal ordering without needing synchronized physical time","Google Spanner's TrueTime is a notable exception — it uses GPS/atomic clocks with bounded uncertainty intervals to get strong global ordering guarantees, at real infrastructure cost","Hybrid logical clocks combine physical time (for human-readable ordering) with logical counters (for correctness) as a practical middle ground","Relying on timestamps for conflict resolution (last-write-wins) is a common simplification that can silently produce wrong results under clock skew"] },
  ],
  case_studies: [
    { g: "Classic design-round problems" },
    { r: 45, title: "Design a URL shortener (ID generation, redirect path, analytics)", diff: "medium", tags: ["case study"],
      points: ["ID generation approaches: auto-increment + base62 encoding, pre-generated key pool, or a distributed ID generator (Snowflake-style) — discuss collision avoidance for each","Redirect path is read-heavy and latency-critical — heavy caching (CDN/edge + app cache) in front of the DB lookup is the core design lever","Custom alias support adds a uniqueness-constraint write path alongside the auto-generated path","Analytics (click counts, referrers) should be captured asynchronously (via a queue) so it never adds latency to the redirect itself","Expiration/TTL handling for links, and whether deleted/expired short codes can be reused safely"] },
    { r: 46, title: "Design a rate limiter as a shared service (multi-instance correctness)", diff: "medium", tags: ["case study"],
      points: ["Moving from a single-instance in-memory counter to a shared store (Redis) so the limit is enforced correctly across many API gateway instances","Atomicity of the check-and-increment operation under concurrency — a Lua script in Redis (or Redis's atomic INCR + EXPIRE) avoids race conditions a naive get-then-set would have","Choosing the algorithm (token bucket vs sliding window counter) and how its state maps to a Redis data structure efficiently","Per-user vs per-IP vs per-API-key limiting, and how keys are namespaced/expired in the shared store to avoid unbounded growth","Latency budget for the rate-limit check itself — it sits on the hot path of every request, so the shared-store round-trip cost matters"] },
    { r: 47, title: "Design a news feed / timeline (fan-out on write vs read)",    diff: "hard",   tags: ["case study"],
      points: ["Fan-out on write: precompute each follower's feed when a post is created — fast reads, but expensive/slow writes for users with millions of followers","Fan-out on read: assemble the feed at request time by querying all followed users' recent posts — fast writes, but expensive reads, especially for users following many people","Hybrid approach: fan-out on write for most users, fall back to fan-out on read for celebrity accounts with huge follower counts — the standard real-world compromise","Feed storage as a per-user list (often in Redis or a wide-column store) rather than recomputing from the raw posts table every time","Ranking/personalization as a separate concern layered on top of the raw chronological feed assembly"] },
    { r: 48, title: "Design a chat system (WebSockets, delivery guarantees, presence)", diff: "hard",   tags: ["case study"],
      points: ["WebSocket connections held by stateful gateway servers — requires a connection registry (which server holds which user's socket) typically backed by Redis","Message delivery: sender → message service → recipient's connection server (looked up via the registry) → WebSocket push; offline users get the message queued for delivery on reconnect","Delivery guarantee and ordering per conversation — message IDs/sequence numbers per chat to detect gaps/out-of-order delivery on the client","Presence (online/offline/typing) as a separate, high-churn, eventually-consistent data path — doesn't need the same durability guarantees as message content","Group chat fan-out considerations — a message to a 500-person group is structurally similar to the news feed fan-out problem"] },
    { r: 49, title: "Design a distributed cache (sharding, eviction, replication)", diff: "hard",   tags: ["case study"],
      points: ["Client-side consistent hashing (or a proxy layer) to determine which cache node owns a given key, distributing load across the cluster","Eviction policy (LRU/LFU/TTL-based) implemented per-node, since each node only manages its own shard of the overall keyspace","Replication for availability — without it, losing a node means losing that shard's cached data entirely, which simply increases DB load (a 'soft' failure) rather than causing an outage","Hot key mitigation directly ties back to the hotspot topic — a single popular key can overload its one owning node regardless of overall cluster size","Cache invalidation propagation across nodes when underlying data changes — pub/sub invalidation messages or short TTLs as the two common approaches"] },
    { r: 50, title: "Design a notification system at scale (fan-out, channel routing, retries)", diff: "medium", tags: ["case study"],
      points: ["Event ingestion (something happened) decoupled from notification delivery via a queue, so a slow delivery channel never blocks the triggering action","Fan-out to multiple channels (email/SMS/push) per notification, each with its own retry/backoff policy and failure characteristics","User preference and rate-limiting service consulted before sending — avoiding notification fatigue is as much a design concern as delivery reliability","Template rendering and localization as a separate pipeline stage from the channel-specific delivery adapters","Dead-letter handling for notifications that repeatedly fail to deliver, plus visibility/alerting on delivery failure rates"] },
    { r: 51, title: "Design a ride-sharing dispatch system (geo-indexing, matching)", diff: "hard",   tags: ["case study"],
      points: ["Geo-indexing: a geohash or quad-tree-based spatial index lets you efficiently query 'drivers near this location' instead of scanning all drivers","Driver location updates are extremely high-frequency writes — typically batched/throttled and written to a fast in-memory geo-index (e.g. Redis GEO commands) rather than the primary DB directly","Matching algorithm balances multiple factors (distance, ETA, driver rating, surge pricing zone) — often modeled as a scoring function over a candidate set from the geo-index","Real-time bidirectional communication (driver location updates, ride status changes) typically uses WebSockets or a similar push mechanism, echoing the chat system design","Handling the race condition of multiple riders being matched to the same driver simultaneously needs an explicit atomic assignment step"] },
    { r: 52, title: "Design a video streaming platform (encoding, CDN, adaptive bitrate)", diff: "hard",   tags: ["case study"],
      points: ["Upload pipeline: raw video stored, then asynchronously transcoded into multiple resolutions/bitrates by a worker fleet (queue-driven, since transcoding is slow and CPU-heavy)","Adaptive bitrate streaming (HLS/DASH) splits video into small segments at multiple quality levels; the client player switches quality dynamically based on measured bandwidth","CDN distribution of the segmented video files is essential — origin servers can't handle the bandwidth of serving video directly to a large audience","Metadata service (titles, thumbnails, view counts) is architecturally separate from the actual video byte delivery path, with very different scaling characteristics","Live streaming adds tighter latency constraints than video-on-demand, often requiring different protocols/infrastructure (e.g. WebRTC or low-latency HLS) than the VOD pipeline"] },
    { r: 53, title: "Design a distributed job scheduler (cron at scale, idempotent execution)", diff: "hard",   tags: ["case study"],
      points: ["A single scheduler instance is a single point of failure — leader election (via a consensus system like ZooKeeper/etcd) ensures exactly one active scheduler at a time","Jobs stored durably with their schedule (cron expression or one-off time) so a scheduler restart doesn't lose pending work","Idempotent job execution is essential — a scheduler crash/failover right at execution time can cause the same job to be triggered twice","Distributing execution across a worker fleet (scheduler decides what/when, workers do the actual execution) decouples scheduling logic from execution capacity","Handling missed schedules (the scheduler itself was down when a job should have fired) — catch-up logic vs explicitly skipping missed runs needs a clear policy"] },
    { r: 54, title: "Design an autocomplete / typeahead service (trie sharding, ranking)", diff: "medium", tags: ["case study"],
      points: ["Trie (prefix tree) as the core data structure for efficient prefix matching, often augmented at each node with top-K cached results to avoid traversing subtrees on every query","For very large vocabularies, the trie itself may need to be sharded (e.g. by first character/prefix range) across multiple nodes","Ranking by frequency/popularity/personalization needs periodic offline recomputation rather than real-time updates on every keystroke across the whole system","Caching at the edge (CDN/app cache) is highly effective here since the same popular prefixes are queried extremely often","Update strategy for the trie as new terms become popular — typically a batch rebuild/merge process rather than fully real-time insertion"] },
    { r: 55, title: "Design a payments system (idempotency, ledger, double-entry consistency)", diff: "hard",   tags: ["case study"],
      points: ["Idempotency keys on every payment request are non-negotiable — clients retrying a timed-out request must not double-charge","Double-entry ledger (every transaction recorded as a debit and a matching credit) provides built-in auditability and makes balance-sum invariants easy to verify","Strong consistency requirements here push toward traditional ACID transactions for the core ledger, even if other parts of the system are eventually consistent","Integration with external payment processors requires careful state machine design (pending, authorized, captured, failed, refunded) with reconciliation jobs to catch state drift from webhook/callback failures","This is one of the few domains where 'exactly-once' truly matters and most of the design effort goes into guaranteeing it through idempotency + ledger invariants, not just acknowledging it's hard"] },
    { r: 56, title: "Design a web crawler (politeness, dedup, distributed frontier queue)", diff: "hard",   tags: ["case study"],
      points: ["Frontier queue (URLs to crawl next) needs to be distributed and prioritized, typically partitioned by domain to support the politeness requirement below","Politeness policy: respecting robots.txt and rate-limiting requests per domain so the crawler doesn't overwhelm any single site — usually enforced via per-domain queues/throttles","URL deduplication at scale uses a space-efficient probabilistic structure (Bloom filter) to avoid re-crawling the same URL, accepting a small false-positive rate","DNS resolution caching is important since the crawler will repeatedly resolve the same domains across many URLs","Content-based deduplication (near-identical pages at different URLs) is a separate, harder problem from URL-based dedup, often using content hashing/shingling"] },
  ],
};

/* ════════════════════════════════════════════════════════════════════
   TRACK REGISTRY — wires each track to its topics/data so the
   rest of the component can stay track-agnostic
   ════════════════════════════════════════════════════════════════════ */
const TRACK_REGISTRY = {
  dsa:  { topics: DSA_TOPICS,  data: DSA_DATA,  defaultTab: "arrays", kind: "lc" },
  java: { topics: JAVA_TOPICS, data: JAVA_DATA, defaultTab: "oop",    kind: "resource" },
  lld:  { topics: LLD_TOPICS,  data: LLD_DATA,  defaultTab: "principles", kind: "resource" },
  hld:  { topics: HLD_TOPICS,  data: HLD_DATA,  defaultTab: "fundamentals", kind: "resource" },
};

function getQuestions(items) { return items.filter(x => x.title); }
function getKey(trackId, topicId, index) { return `${trackId}-${topicId}-${index}`; }

// Resource-kind items don't have a LeetCode page; route them to a useful
// external reference instead (GeeksforGeeks search for the exact phrase).
function resourceSearchUrl(title) {
  const clean = title.split(" — ")[0].split(" (")[0];
  return `https://www.google.com/search?q=${encodeURIComponent(clean + " interview")}`;
}

function lcUrl(lcNumber) {
  const slug = LC_SLUGS[lcNumber];
  return slug ? `https://leetcode.com/problems/${slug}/` : `https://leetcode.com/problemset/?search=${lcNumber}`;
}

export default function App() {
  const [activeTrack, setActiveTrack] = usePersistedState("activeTrack", "dsa");
  const [activeTab, setActiveTab]     = usePersistedState("activeTab", TRACK_REGISTRY.dsa.defaultTab);
  const [solved, setSolved]                 = usePersistedState("solved", {});
  const [bookmarked, setBookmarked]         = usePersistedState("bookmarked", {});
  const [search, setSearch]                 = useState("");
  const [filterDiff, setFilterDiff]         = useState("all");
  const [showOnlyUnsolved, setShowOnlyUnsolved] = useState(false);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);

  const track = TRACK_REGISTRY[activeTrack];
  const TOPICS = track.topics;
  const DATA = track.data;

  function switchTrack(trackId) {
    setActiveTrack(trackId);
    setActiveTab(TRACK_REGISTRY[trackId].defaultTab);
    setSearch("");
    setFilterDiff("all");
    setShowOnlyUnsolved(false);
    setShowOnlyBookmarked(false);
  }

  const allQuestions = useMemo(() => {
    let total = 0;
    const map = {};
    TOPICS.forEach(t => {
      const n = getQuestions(DATA[t.id]).length;
      total += n;
      map[t.id] = n;
    });
    return { total, map };
  }, [TOPICS, DATA]);

  const solvedCount = useMemo(() => {
    let c = 0;
    TOPICS.forEach(t => {
      const qs = getQuestions(DATA[t.id]);
      qs.forEach((_, i) => { if (solved[getKey(activeTrack, t.id, i + 1)]) c++; });
    });
    return c;
  }, [TOPICS, DATA, solved, activeTrack]);

  const pct = allQuestions.total ? Math.round((solvedCount / allQuestions.total) * 100) : 0;

  function toggleSolved(key) {
    setSolved(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleBookmarked(key) {
    setBookmarked(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const bookmarkedCount = useMemo(() => Object.values(bookmarked).filter(Boolean).length, [bookmarked]);

  const [confirmReset, setConfirmReset] = useState(false);
  function resetProgress() {
    if (!confirmReset) { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); return; }
    setSolved({});
    setBookmarked({});
    setConfirmReset(false);
  }

  const topicSolvedCount = (topicId) => {
    const qs = getQuestions(DATA[topicId]);
    return qs.filter((_, i) => solved[getKey(activeTrack, topicId, i + 1)]).length;
  };

  const items = DATA[activeTab] || [];
  let qIndex = 0;
  const filtered = [];
  items.forEach(item => {
    if (item.g) { filtered.push({ ...item, _type: "group" }); return; }
    qIndex++;
    const key = getKey(activeTrack, activeTab, qIndex);
    const isSolved = !!solved[key];
    const isBookmarked = !!bookmarked[key];
    const q = search.toLowerCase();
    const matchSearch = !search ||
      item.title.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q)) ||
      (item.lc !== undefined && String(item.lc).includes(q));
    const matchDiff = filterDiff === "all" || item.diff === filterDiff;
    const matchUnsolved = !showOnlyUnsolved || !isSolved;
    const matchBookmarked = !showOnlyBookmarked || isBookmarked;
    if (matchSearch && matchDiff && matchUnsolved && matchBookmarked)
      filtered.push({ ...item, _type: "question", _key: key, _index: qIndex, _solved: isSolved, _bookmarked: isBookmarked });
  });

  const cleaned = [];
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i]._type === "group") {
      if (filtered[i + 1] && filtered[i + 1]._type === "question") cleaned.push(filtered[i]);
    } else { cleaned.push(filtered[i]); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#e2e8f0", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Track switcher ── */}
      <div style={{ borderBottom: "1px solid #1e2535", background: "#0c0f19", padding: "0 24px", display: "flex", gap: 2, overflowX: "auto" }}>
        {Object.entries(TRACK_REGISTRY).map(([id, cfg]) => {
          const meta = TRACKS.find(t => t.id === id);
          const isActive = activeTrack === id;
          return (
            <button key={id} onClick={() => switchTrack(id)}
              style={{ padding: "12px 18px 10px", background: "transparent", border: "none", borderBottom: `2px solid ${isActive?"#3b82f6":"transparent"}`, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, flexShrink: 0 }}>
              <span style={{ fontSize: 13.5, fontWeight: isActive?700:500, color: isActive?"#f1f5f9":"#64748b", letterSpacing: "-0.01em" }}>{meta.label}</span>
              <span style={{ fontSize: 10, color: isActive?"#60a5fa":"#3f4a5c" }}>{meta.sub}</span>
            </button>
          );
        })}
      </div>

      {/* ── Header ── */}
      <div style={{ borderBottom: "1px solid #1e2535", padding: "18px 24px 14px", background: "#0f1117", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "#f1f5f9" }}>{TRACKS.find(t=>t.id===activeTrack).label} Prep</span>
              <span style={{ fontSize: 11, fontWeight: 600, background: "#1e3a5f", color: "#60a5fa", padding: "2px 8px", borderRadius: 20, border: "1px solid #1d4ed8" }}>SDE3</span>
            </div>
            <div style={{ fontSize: 12, color: "#475569", marginTop: 2 }}>{allQuestions.total} topics · {TOPICS.length} sections</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", lineHeight: 1 }}>
              {solvedCount}<span style={{ fontSize: 13, fontWeight: 400, color: "#64748b" }}>/{allQuestions.total}</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1, display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
              <span>{pct}% complete</span>
              <span style={{ color: "#374151" }}>·</span>
              <span title="Progress is saved in this browser automatically">saved locally</span>
              <button onClick={resetProgress}
                style={{ marginLeft: 4, fontSize: 10, padding: "2px 7px", borderRadius: 12, border: `1px solid ${confirmReset?"#7f1d1d":"#1e2535"}`, background: confirmReset?"#270d12":"#1a1f2e", color: confirmReset?"#fca5a5":"#64748b", cursor: "pointer" }}>
                {confirmReset ? "Confirm reset?" : "Reset"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#1e2535", borderRadius: 2, marginBottom: 12 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#3b82f6,#6366f1)", borderRadius: 2, transition: "width 0.4s ease" }} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", alignItems: "center" }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={track.kind === "lc" ? "Search by name, tag, or LC#…" : "Search by name or tag…"}
            style={{ flex: "1 1 180px", minWidth: 0, background: "#1a1f2e", border: "1px solid #1e2535", borderRadius: 8, padding: "6px 12px", color: "#e2e8f0", fontSize: 13, outline: "none" }} />
          {["all","easy","medium","hard"].map(d => (
            <button key={d} onClick={() => setFilterDiff(d)}
              style={{ padding: "5px 11px", borderRadius: 20, border: `1px solid ${filterDiff===d?"#3b82f6":"#1e2535"}`, background: filterDiff===d?"#1e3a5f":"#1a1f2e", color: filterDiff===d?"#60a5fa":"#64748b", fontSize: 12, cursor: "pointer", fontWeight: filterDiff===d?600:400, textTransform: "capitalize" }}>
              {d}
            </button>
          ))}
          <button onClick={() => setShowOnlyUnsolved(v => !v)}
            style={{ padding: "5px 11px", borderRadius: 20, border: `1px solid ${showOnlyUnsolved?"#6366f1":"#1e2535"}`, background: showOnlyUnsolved?"#1e1e3f":"#1a1f2e", color: showOnlyUnsolved?"#a5b4fc":"#64748b", fontSize: 12, cursor: "pointer", fontWeight: showOnlyUnsolved?600:400, whiteSpace: "nowrap" }}>
            Unsolved only
          </button>
          <button onClick={() => setShowOnlyBookmarked(v => !v)}
            style={{ padding: "5px 11px", borderRadius: 20, border: `1px solid ${showOnlyBookmarked?"#d97706":"#1e2535"}`, background: showOnlyBookmarked?"#2a1d05":"#1a1f2e", color: showOnlyBookmarked?"#fbbf24":"#64748b", fontSize: 12, cursor: "pointer", fontWeight: showOnlyBookmarked?600:400, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11 }}>{showOnlyBookmarked ? "★" : "☆"}</span>
            Bookmarked{bookmarkedCount > 0 ? ` (${bookmarkedCount})` : ""}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100vh - 188px)" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 216, flexShrink: 0, borderRight: "1px solid #1e2535", padding: "14px 0", background: "#0c0f19", overflowY: "auto" }}>
          {TOPICS.map(t => {
            const sc = topicSolvedCount(t.id);
            const tc = allQuestions.map[t.id];
            const isActive = activeTab === t.id;
            const tpct = tc ? Math.round(sc / tc * 100) : 0;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "8px 14px", background: isActive?"#1a1f2e":"transparent", border: "none", borderLeft: `2px solid ${isActive?"#3b82f6":"transparent"}`, color: isActive?"#f1f5f9":"#64748b", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                <span style={{ width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", background: isActive?"#1e3a5f":"#1a1f2e", borderRadius: 6, fontSize: 11, fontWeight: 700, color: isActive?"#60a5fa":"#475569", flexShrink: 0 }}>{t.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive?600:400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                    <div style={{ flex: 1, height: 2, background: "#1e2535", borderRadius: 1 }}>
                      <div style={{ height: "100%", width: `${tpct}%`, background: sc===tc?"#22c55e":"#3b82f6", borderRadius: 1 }} />
                    </div>
                    <span style={{ fontSize: 10, color: sc===tc?"#22c55e":"#475569", flexShrink: 0 }}>{sc}/{tc}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ── Main content ── */}
        <div style={{ flex: 1, padding: "18px 22px", overflow: "auto" }}>

          {/* Topic header */}
          {(() => {
            const t = TOPICS.find(x => x.id === activeTab);
            const sc = topicSolvedCount(activeTab);
            const tc = allQuestions.map[activeTab];
            const tpct = tc ? Math.round(sc / tc * 100) : 0;
            return (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#f1f5f9" }}>{t.label}</h2>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>{tc} {track.kind === "lc" ? "questions" : "topics"} · {sc} done</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 80, height: 3, background: "#1e2535", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${tpct}%`, background: "#3b82f6", borderRadius: 2, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 12, color: "#3b82f6", fontWeight: 600 }}>{tpct}%</span>
                </div>
              </div>
            );
          })()}

          {/* Empty state */}
          {cleaned.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>◌</div>
              <div style={{ fontSize: 14 }}>No items match your filters</div>
            </div>
          )}

          {/* Question / topic cards */}
          {cleaned.map((item, i) => {
            if (item._type === "group") {
              return (
                <div key={`g-${i}`} style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#475569", margin: i===0?"0 0 10px":"22px 0 10px", paddingBottom: 6, borderBottom: "1px solid #1e2535" }}>
                  {item.g}
                </div>
              );
            }
            const dc = DIFF_COLOR[item.diff];
            const isLc = item.lc !== undefined;
            const link = isLc ? lcUrl(item.lc) : resourceSearchUrl(item.title);
            const badgeLabel = isLc ? `#${item.lc}` : `Q${item.r}`;
            const hasPoints = Array.isArray(item.points) && item.points.length > 0;
            return (
              <div key={item._key}
                style={{ display: "flex", alignItems: "flex-start", gap: 11, padding: "11px 13px", background: item._solved?"#0d1520":"#111827", border: `1px solid ${item._bookmarked?"#5c4310":"#1e2535"}`, borderRadius: 10, marginBottom: 6, transition: "border-color 0.15s", opacity: item._solved?0.6:1 }}
                onMouseEnter={e => { if (!item._solved) e.currentTarget.style.borderColor = item._bookmarked ? "#78531a" : "#2d3748"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = item._bookmarked ? "#5c4310" : "#1e2535"; }}>

                {/* Checkbox + bookmark column */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0, marginTop: 2 }}>
                  <button onClick={() => toggleSolved(item._key)}
                    title={item._solved ? "Mark as unsolved" : "Mark as solved"}
                    style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${item._solved?"#22c55e":"#2d3748"}`, background: item._solved?"#16a34a":"transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                    {item._solved && <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>}
                  </button>
                  <button onClick={() => toggleBookmarked(item._key)}
                    title={item._bookmarked ? "Remove bookmark" : "Bookmark for revision"}
                    style={{ width: 20, height: 20, border: "none", background: "transparent", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: item._bookmarked ? "#fbbf24" : "#374151", fontSize: 15, lineHeight: 1, transition: "color 0.15s" }}>
                    {item._bookmarked ? "★" : "☆"}
                  </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 5 }}>
                    {/* badge */}
                    <a href={link} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      title={isLc ? "Open on LeetCode" : "Find reference material"}
                      style={{ fontSize: 10, fontWeight: 700, color: isLc?"#f59e0b":"#818cf8", background: isLc?"#1c1709":"#191a3a", border: `1px solid ${isLc?"#78350f":"#3730a3"}`, borderRadius: 5, padding: "1px 6px", textDecoration: "none", flexShrink: 0, fontFamily: "monospace" }}>
                      {badgeLabel}
                    </a>
                    <span style={{ fontSize: 13, fontWeight: 500, color: item._solved?"#475569":"#e2e8f0", textDecoration: item._solved?"line-through":"none", lineHeight: 1.4 }}>
                      {item.title}
                    </span>
                    {item._bookmarked && <span style={{ fontSize: 10, color: "#fbbf24" }}>★ saved for revision</span>}
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: hasPoints ? 8 : 0 }}>
                    <span style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, fontWeight: 600, background: dc.bg, color: dc.text, border: `1px solid ${dc.border}` }}>{item.diff}</span>
                    {item.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, padding: "1px 7px", borderRadius: 20, background: "#1a1f2e", color: "#64748b", border: "1px solid #1e2535" }}>{tag}</span>
                    ))}
                  </div>
                  {hasPoints && (
                    <ul style={{ margin: 0, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                      {item.points.map((pt, pi) => (
                        <li key={pi} style={{ fontSize: 12, color: item._solved?"#475569":"#94a3b8", lineHeight: 1.5 }}>{pt}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
