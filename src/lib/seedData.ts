import { v4 as uuidv4 } from 'uuid';
import type { Flashcard, NoteEntry, Problem, Subject, Topic } from '../types';
import { nowISO } from './dateUtils';

// ─── Subjects ────────────────────────────────────────────────────

export const SEED_SUBJECTS: Subject[] = [
  { id: 's-dsa',     name: 'DSA',      icon: '🧩', color: '#6366f1', order: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-java',    name: 'Java/OOP', icon: '☕', color: '#f59e0b', order: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-sql',     name: 'SQL',      icon: '🗄️', color: '#10b981', order: 2, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-dbms',    name: 'DBMS',     icon: '💾', color: '#3b82f6', order: 3, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-os',      name: 'OS',       icon: '💻', color: '#8b5cf6', order: 4, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-cn',      name: 'CN',       icon: '🌐', color: '#06b6d4', order: 5, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-python',  name: 'Python',   icon: '🐍', color: '#84cc16', order: 6, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-excel',   name: 'Excel',    icon: '📊', color: '#22c55e', order: 7, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 's-powerbi', name: 'Power BI', icon: '📈', color: '#f97316', order: 8, createdAt: nowISO(), updatedAt: nowISO() },
];

// ─── Topics ──────────────────────────────────────────────────────

export const SEED_TOPICS: Topic[] = [
  // DSA — code topics
  { id: 't-arrays',    subjectId: 's-dsa', name: 'Arrays',              type: 'code',  order: 0,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-strings',   subjectId: 's-dsa', name: 'Strings',             type: 'code',  order: 1,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-ll',        subjectId: 's-dsa', name: 'Linked Lists',        type: 'code',  order: 2,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-trees',     subjectId: 's-dsa', name: 'Trees',               type: 'code',  order: 3,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-graphs',    subjectId: 's-dsa', name: 'Graphs',              type: 'code',  order: 4,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-dp',        subjectId: 's-dsa', name: 'Dynamic Programming', type: 'code',  order: 5,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-sorting',   subjectId: 's-dsa', name: 'Sorting & Searching', type: 'code',  order: 6,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-stacks',    subjectId: 's-dsa', name: 'Stacks & Queues',     type: 'code',  order: 7,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-greedy',    subjectId: 's-dsa', name: 'Greedy',              type: 'code',  order: 8,  createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-backtrack', subjectId: 's-dsa', name: 'Backtracking',        type: 'code',  order: 9,  createdAt: nowISO(), updatedAt: nowISO() },
  // Java/OOP — code
  { id: 't-oopbasics',   subjectId: 's-java', name: 'OOP Basics',            type: 'code',  order: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-collections', subjectId: 's-java', name: 'Collections Framework', type: 'code',  order: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-exceptions',  subjectId: 's-java', name: 'Exception Handling',    type: 'code',  order: 2, createdAt: nowISO(), updatedAt: nowISO() },
  // SQL — code
  { id: 't-sqlbasics', subjectId: 's-sql', name: 'SQL Basics',       type: 'code',  order: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-joins',     subjectId: 's-sql', name: 'Joins',             type: 'code',  order: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-window',    subjectId: 's-sql', name: 'Window Functions',  type: 'code',  order: 2, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-subquery',  subjectId: 's-sql', name: 'Subqueries',        type: 'code',  order: 3, createdAt: nowISO(), updatedAt: nowISO() },
  // DBMS — notes topics (theory-only)
  { id: 't-norm',     subjectId: 's-dbms', name: 'Normalization',        type: 'notes', order: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-txn',      subjectId: 's-dbms', name: 'Transactions & ACID',  type: 'notes', order: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-indexing', subjectId: 's-dbms', name: 'Indexing',             type: 'notes', order: 2, createdAt: nowISO(), updatedAt: nowISO() },
  // OS — notes
  { id: 't-process', subjectId: 's-os', name: 'Processes & Threads', type: 'notes', order: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-memory',  subjectId: 's-os', name: 'Memory Management',   type: 'notes', order: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-sched',   subjectId: 's-os', name: 'CPU Scheduling',      type: 'notes', order: 2, createdAt: nowISO(), updatedAt: nowISO() },
  // CN — notes
  { id: 't-osi',  subjectId: 's-cn', name: 'OSI Model',  type: 'notes', order: 0, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-tcp',  subjectId: 's-cn', name: 'TCP/IP',     type: 'notes', order: 1, createdAt: nowISO(), updatedAt: nowISO() },
  { id: 't-http', subjectId: 's-cn', name: 'HTTP & DNS', type: 'notes', order: 2, createdAt: nowISO(), updatedAt: nowISO() },
];

// ─── Problems ────────────────────────────────────────────────────

function p(id: string, subjectId: string, topicId: string, title: string, difficulty: Problem['difficulty'], patterns: string[]): Problem {
  return {
    id, subjectId, topicId, title, description: '', difficulty, patterns,
    companies: [], status: 'not_started', confidence: 1, important: false,
    notes: '', explainIt: '', attempts: 0, timeSpentSeconds: 0,
    createdAt: nowISO(), updatedAt: nowISO(),
  };
}

export const SEED_PROBLEMS: Problem[] = [
  // Arrays
  p('p-twosum',      's-dsa', 't-arrays', 'Two Sum',                          'Easy',   ['HashMap', 'Two Pointers']),
  p('p-maxsubarray', 's-dsa', 't-arrays', "Kadane's Algorithm (Max Subarray)", 'Medium', ['Kadane', 'DP']),
  p('p-prefixsum',   's-dsa', 't-arrays', 'Prefix Sum',                       'Easy',   ['Prefix Sum']),
  p('p-trapping',    's-dsa', 't-arrays', 'Trapping Rain Water',               'Hard',   ['Two Pointers', 'Stack']),
  p('p-maxproduct',  's-dsa', 't-arrays', 'Maximum Product Subarray',          'Medium', ['DP', 'Kadane']),
  p('p-rotate',      's-dsa', 't-arrays', 'Rotate Array',                      'Medium', ['Two Pointers', 'Math']),
  // Strings
  p('p-anagram',          's-dsa', 't-strings', 'Valid Anagram',                           'Easy',   ['HashMap', 'Sorting']),
  p('p-longestnorepeat',  's-dsa', 't-strings', 'Longest Substring Without Repeating',     'Medium', ['Sliding Window', 'HashMap']),
  p('p-palindrome',       's-dsa', 't-strings', 'Longest Palindromic Substring',           'Medium', ['DP', 'Two Pointers']),
  // Linked Lists
  p('p-reversell', 's-dsa', 't-ll', 'Reverse Linked List',          'Easy', ['Two Pointers']),
  p('p-cycle',     's-dsa', 't-ll', 'Detect Cycle in Linked List',  'Easy', ["Floyd's Algorithm"]),
  p('p-mergell',   's-dsa', 't-ll', 'Merge Two Sorted Lists',       'Easy', ['Two Pointers']),
  // Trees
  p('p-inorder',     's-dsa', 't-trees', 'Binary Tree Inorder Traversal',    'Easy',   ['DFS', 'Stack']),
  p('p-maxdepth',    's-dsa', 't-trees', 'Maximum Depth of Binary Tree',     'Easy',   ['DFS', 'BFS']),
  p('p-lca',         's-dsa', 't-trees', 'Lowest Common Ancestor',           'Medium', ['DFS']),
  p('p-bst-validate','s-dsa', 't-trees', 'Validate Binary Search Tree',      'Medium', ['DFS', 'Inorder']),
  // Graphs
  p('p-bfs',             's-dsa', 't-graphs', 'BFS of Graph',           'Easy',   ['BFS']),
  p('p-dfs',             's-dsa', 't-graphs', 'DFS of Graph',           'Easy',   ['DFS']),
  p('p-topologicalsort', 's-dsa', 't-graphs', 'Topological Sort',      'Medium', ['BFS (Kahn)', 'DFS']),
  p('p-dijkstra',        's-dsa', 't-graphs', "Dijkstra's Algorithm",  'Medium', ['Greedy', 'Heap']),
  // DP
  p('p-coinchange', 's-dsa', 't-dp', 'Coin Change',                        'Medium', ['DP', 'BFS']),
  p('p-lcs',        's-dsa', 't-dp', 'Longest Common Subsequence',         'Medium', ['DP']),
  p('p-knapsack',   's-dsa', 't-dp', '0/1 Knapsack',                       'Medium', ['DP']),
  p('p-lis',        's-dsa', 't-dp', 'Longest Increasing Subsequence',     'Medium', ['DP', 'Binary Search']),
  // Sorting
  p('p-mergesort',    's-dsa', 't-sorting', 'Merge Sort',                          'Medium', ['Divide & Conquer']),
  p('p-binsearch',    's-dsa', 't-sorting', 'Binary Search',                       'Easy',   ['Binary Search']),
  p('p-binsearchrot', 's-dsa', 't-sorting', 'Search in Rotated Sorted Array',      'Medium', ['Binary Search']),
  // SQL
  p('p-sql-rank', 's-sql', 't-window',   'Rank Employees by Salary',      'Medium', ['Window Functions']),
  p('p-sql-nth',  's-sql', 't-window',   'Nth Highest Salary',             'Medium', ['Window Functions', 'Subquery']),
  p('p-sql-join', 's-sql', 't-joins',    'Employees with No Department',   'Easy',   ['LEFT JOIN']),
  p('p-sql-dup',  's-sql', 't-sqlbasics','Find Duplicate Emails',          'Easy',   ['GROUP BY', 'HAVING']),
  // Java/OOP
  p('p-poly',    's-java', 't-oopbasics',  'Polymorphism Example',              'Easy',   ['OOP']),
  p('p-generic', 's-java', 't-collections','Generic Stack using ArrayList',     'Medium', ['Generics', 'Collections']),
  // Stacks
  p('p-validparen', 's-dsa', 't-stacks', 'Valid Parentheses', 'Easy',   ['Stack']),
  p('p-minstack',   's-dsa', 't-stacks', 'Min Stack',          'Medium', ['Stack', 'Design']),
  // Greedy
  p('p-activity', 's-dsa', 't-greedy', 'Activity Selection', 'Medium', ['Greedy', 'Sorting']),
  p('p-jumps',    's-dsa', 't-greedy', 'Jump Game',           'Medium', ['Greedy']),
  // Backtracking
  p('p-permutations', 's-dsa', 't-backtrack', 'Permutations', 'Medium', ['Backtracking']),
  p('p-nqueens',      's-dsa', 't-backtrack', 'N-Queens',      'Hard',   ['Backtracking']),
];

// ─── Seed NoteEntries (DBMS — Normalization) ─────────────────────

export function buildSeedNoteEntries(): NoteEntry[] {
  const entries: Omit<NoteEntry, 'id'>[] = [
    {
      subjectId: 's-dbms',
      topicId: 't-norm',
      title: 'Normal Forms (1NF → BCNF)',
      content: `## What is Normalization?
Normalization is the process of organizing a relational database to reduce redundancy and improve data integrity.

## 1NF (First Normal Form)
- Every column must be atomic (no multi-valued attributes, no repeating groups).
- Each row must be unique (primary key exists).

**Bad example:** \`Student(id, name, hobbies)\` where hobbies = "cricket, chess"  
**Fix:** Separate hobbies into a new table.

## 2NF (Second Normal Form)
- Must be in 1NF.
- No **partial dependency** — every non-key attribute must depend on the **entire** primary key (relevant only when PK is composite).

## 3NF (Third Normal Form)
- Must be in 2NF.
- No **transitive dependency** — non-key attributes must depend only on the primary key, not on other non-key attributes.

**Example:** \`Employee(emp_id, dept_id, dept_name)\`  
Here dept_name depends on dept_id, not emp_id → transitive dependency → violates 3NF.  
Fix: Move dept_name to a Departments table.

## BCNF (Boyce-Codd Normal Form)
- Stricter than 3NF.
- For every functional dependency X → Y, X must be a super key.
`,
      importantPoints: [
        '1NF: atomic values',
        '2NF: no partial dependency on composite PK',
        '3NF: no transitive dependency',
        'BCNF: every determinant is a super key',
      ],
      commonQuestions: `## Common Interview Questions

**Q: What is the difference between 3NF and BCNF?**  
A: In 3NF, a non-key attribute can determine another non-key attribute as long as the LHS is a key. BCNF is stricter — every determinant (LHS of any FD) must be a super key, eliminating anomalies that 3NF misses.

**Q: Can a table be in 3NF but not BCNF?**  
A: Yes. Example: a table with overlapping candidate keys where a non-prime attribute determines part of a candidate key.

**Q: Why do we normalize?**  
A: To eliminate insertion, update, and deletion anomalies, and to reduce data redundancy.
`,
      status: 'not_started',
      confidence: 1,
      important: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      subjectId: 's-dbms',
      topicId: 't-txn',
      title: 'ACID Properties & Transactions',
      content: `## What is a Transaction?
A transaction is a sequence of one or more SQL operations treated as a single logical unit of work.

## ACID Properties

| Property | Meaning |
|---|---|
| **Atomicity** | All operations succeed or none do. Uses ROLLBACK on failure. |
| **Consistency** | DB moves from one valid state to another. Constraints are never violated mid-transaction. |
| **Isolation** | Concurrent transactions don't interfere. Managed by locking / MVCC. |
| **Durability** | Once committed, data persists even after crashes. Ensured by WAL (Write-Ahead Logging). |

## Isolation Levels (SQL standard)
1. **Read Uncommitted** — can read dirty (uncommitted) data
2. **Read Committed** — only reads committed data (default in many DBs)
3. **Repeatable Read** — same row read twice gives same result
4. **Serializable** — fully serial execution, no anomalies

## Common Concurrency Problems
- **Dirty Read**: reading uncommitted data
- **Non-repeatable Read**: same query returns different data
- **Phantom Read**: new rows appear in repeated range queries
`,
      importantPoints: [
        'Atomicity = all or nothing',
        'Durability = WAL / redo logs',
        'Isolation levels: Read Uncommitted → Serializable',
        'Deadlock: two txns wait for each other\'s lock',
      ],
      commonQuestions: `## Common Interview Questions

**Q: What is a deadlock and how is it handled?**  
A: A deadlock occurs when two or more transactions are waiting for each other's locks. DBMSs detect deadlocks using a wait-for graph and resolve them by aborting one transaction.

**Q: Difference between COMMIT and ROLLBACK?**  
A: COMMIT makes all changes permanent. ROLLBACK undoes all changes back to the last COMMIT or savepoint.

**Q: What is a savepoint?**  
A: A named point within a transaction to which you can partially rollback without rolling back the entire transaction.
`,
      status: 'not_started',
      confidence: 1,
      important: true,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
    {
      subjectId: 's-dbms',
      topicId: 't-indexing',
      title: 'Indexing & B+ Trees',
      content: `## What is an Index?
An index is a data structure that improves the speed of data retrieval at the cost of additional storage and slower writes.

## Types of Indexes
- **Primary Index**: built on the primary key, data file is sorted on this key.
- **Secondary Index**: built on non-key attribute.
- **Dense Index**: one entry per record.
- **Sparse Index**: one entry per block (only for sorted files).
- **Clustered Index**: row data physically ordered by the index key.
- **Non-clustered Index**: index is separate from row data (like a book's index).

## B+ Tree (Most Common Index Structure)
- All data records (or pointers) are stored in **leaf nodes**.
- Internal nodes store only **keys** for routing.
- Leaf nodes are linked as a doubly linked list → efficient range queries.
- Height is O(log n) → O(log n) for search, insert, delete.

## When to Add an Index?
✅ Columns frequently used in WHERE, JOIN ON, ORDER BY  
❌ Columns with low cardinality (e.g. boolean)  
❌ Small tables (full scan is faster)  
❌ Columns that are frequently updated
`,
      importantPoints: [
        'B+ Tree: data only in leaf nodes',
        'Clustered = data physically sorted by index key',
        'Non-clustered = separate structure, pointer to row',
        'Too many indexes → slow writes',
      ],
      commonQuestions: `## Common Interview Questions

**Q: Difference between clustered and non-clustered index?**  
A: A clustered index determines the physical order of rows in the table — there can be only one. A non-clustered index is a separate structure with pointers to the actual rows — there can be many.

**Q: What is a covering index?**  
A: An index that contains all the columns needed to satisfy a query, so the DB engine never needs to access the actual table rows.

**Q: Why can a table have only one clustered index?**  
A: Because the data rows can only be physically sorted in one way.
`,
      status: 'not_started',
      confidence: 1,
      important: false,
      createdAt: nowISO(),
      updatedAt: nowISO(),
    },
  ];
  return entries.map(e => ({ ...e, id: uuidv4() }));
}

// ─── Flashcards ──────────────────────────────────────────────────

export function buildSeedFlashcards(): Flashcard[] {
  const cards: Omit<Flashcard, 'id'>[] = [
    // DBMS
    { subjectId: 's-dbms', topicId: 't-norm',     question: 'What is 1NF?',              answer: 'A relation is in 1NF if every attribute is atomic (no repeating groups or arrays).', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-dbms', topicId: 't-norm',     question: 'What is 2NF?',              answer: 'In 1NF and every non-key attribute is fully functionally dependent on the entire primary key (no partial dependencies).', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-dbms', topicId: 't-norm',     question: 'What is 3NF?',              answer: 'In 2NF and no transitive dependencies — non-key attributes depend only on the primary key.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-dbms', topicId: 't-txn',      question: 'What does ACID stand for?', answer: 'Atomicity, Consistency, Isolation, Durability — properties that guarantee reliable transactions.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-dbms', topicId: 't-txn',      question: 'What is a deadlock?',       answer: 'A situation where two or more transactions are waiting for each other to release locks, causing a cycle with no progress.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-dbms', topicId: 't-indexing', question: 'What is a B+ Tree index?',  answer: 'A balanced tree where all data records live in leaf nodes linked as a list, and internal nodes store only keys, enabling fast range queries and O(log n) lookups.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    // OS
    { subjectId: 's-os', topicId: 't-process', question: 'Difference between process and thread?', answer: 'A process is an independent program with its own memory space. A thread is a lightweight unit within a process sharing the same memory.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-os', topicId: 't-memory',  question: 'What is virtual memory?',                answer: 'An abstraction that gives each process the illusion of a large, contiguous address space by using disk (swap) as an extension of RAM.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-os', topicId: 't-sched',   question: 'Preemptive vs non-preemptive scheduling?', answer: 'Preemptive: OS can forcibly take CPU. Non-preemptive: process runs until it yields or completes.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    // CN
    { subjectId: 's-cn', topicId: 't-osi',  question: 'OSI layers top to bottom?',          answer: 'Application, Presentation, Session, Transport, Network, Data Link, Physical.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-cn', topicId: 't-tcp',  question: 'TCP 3-way handshake?',               answer: 'SYN → SYN-ACK → ACK. Establishes reliable connection before data transfer.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
    { subjectId: 's-cn', topicId: 't-http', question: 'Difference between HTTP and HTTPS?', answer: 'HTTPS uses TLS/SSL encryption over HTTP, protecting data from eavesdropping and tampering.', confidence: 1, createdAt: nowISO(), updatedAt: nowISO() },
  ];
  return cards.map(c => ({ ...c, id: uuidv4() }));
}
