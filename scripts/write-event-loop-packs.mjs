import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packsDir = path.join(rootDir, 'public/packs/js/event-loop')

/** @typedef {{ type: 'code', language: 'js', text: string, options: string[], correctIndex: number, skipVerify?: boolean }} Draft */

/** @type {Draft[]} */
const level0 = [
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nconsole.log(3);',
    options: ['1, 3, 2', '1, 2, 3', '2, 1, 3', '3, 2, 1'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nsetTimeout(() => console.log(3), 0);\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 4, 2, 3', '1, 4, 3, 2', '4, 1, 2, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => {\n  console.log(2);\n  setTimeout(() => console.log(3), 0);\n}, 0);\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '4, 1, 2, 3'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nconsole.log(2);\nsetTimeout(() => console.log(3), 0);\nconsole.log(4);',
    options: ['1, 2, 3, 4', '2, 1, 4, 3', '2, 4, 1, 3', '2, 4, 3, 1'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n}, 0);\nconsole.log(2);\nconsole.log(3);',
    options: ['1, 2, 3', '2, 1, 3', '2, 3, 1', '3, 2, 1'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'function f() {\n  console.log(1);\n}\nsetTimeout(f, 0);\nf();\nconsole.log(2);',
    options: ['1, 2, 1', '1, 1, 2', '2, 1, 1', '1, 2'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);',
    options: ['1, 2, 3', '1, 3, 2', '2, 1, 3', '3, 1, 2'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve().then(() => console.log(1));\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);',
    options: ['1, 2, 3', '3, 2, 1', '3, 1, 2', '1, 3, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve()\n  .then(() => console.log(1))\n  .then(() => console.log(2));\nconsole.log(3);',
    options: ['1, 2, 3', '3, 2, 1', '1, 3, 2', '3, 1, 2'],
    correctIndex: 3,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nPromise.resolve(2).then((n) => console.log(n));\nconsole.log(3);',
    options: ['1, 2, 3', '1, 3, 2', '2, 1, 3', '3, 1, 2'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: '(function () {\n  console.log(1);\n  setTimeout(() => console.log(2), 0);\n})();\nconsole.log(3);',
    options: ['1, 2, 3', '1, 3, 2', '3, 1, 2', '2, 1, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nfor (let i = 2; i <= 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '4, 1, 2, 3'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'function a() {\n  console.log(1);\n  setTimeout(() => console.log(2), 0);\n  b();\n}\nfunction b() {\n  console.log(3);\n}\na();\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 3, 2, 4', '1, 3, 4, 2', '1, 4, 3, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nconsole.log(3);\nsetTimeout(() => console.log(4), 0);',
    options: ['1, 2, 3, 4', '1, 3, 4, 2', '1, 3, 2, 4', '3, 1, 2, 4'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nnew Promise((resolve) => {\n  console.log(2);\n  resolve();\n});\nconsole.log(3);',
    options: ['1, 2, 3', '1, 3, 2', '2, 1, 3', '1, 2'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nnew Promise((resolve) => {\n  console.log(2);\n  resolve();\n}).then(() => console.log(3));\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 2, 4, 3', '1, 4, 2, 3', '1, 3, 2, 4'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nsetTimeout(() => console.log(2), 0);\nsetTimeout(() => console.log(3), 0);\nconsole.log(4);',
    options: ['1, 2, 3, 4', '4, 3, 2, 1', '4, 1, 2, 3', '1, 4, 2, 3'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => {\n  console.log(2);\n  console.log(3);\n}, 0);\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '4, 1, 2, 3'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nconsole.log(2);\nsetTimeout(() => console.log(3), 0);\nconsole.log(4);\nconsole.log(5);',
    options: ['1, 2, 3, 4, 5', '1, 2, 4, 5, 3', '1, 2, 4, 3, 5', '3, 1, 2, 4, 5'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve().then(() => {\n  console.log(1);\n  console.log(2);\n});\nconsole.log(3);',
    options: ['1, 2, 3', '3, 2, 1', '1, 3, 2', '3, 1, 2'],
    correctIndex: 3,
  },
]

/** @type {Draft[]} */
const level1 = [
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['1, 2, 3, 4', '1, 4, 2, 3', '1, 4, 3, 2', '1, 3, 4, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nqueueMicrotask(() => console.log(3));\nconsole.log(4);',
    options: ['1, 3, 4, 2', '1, 4, 2, 3', '1, 2, 3, 4', '1, 4, 3, 2'],
    correctIndex: 3,
  },
  {
    type: 'code',
    language: 'js',
    text: 'queueMicrotask(() => console.log(1));\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);',
    options: ['1, 2, 3', '3, 2, 1', '3, 1, 2', '1, 3, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nqueueMicrotask(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 2, 3, 1', '4, 3, 2, 1', '2, 3, 4, 1'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  await Promise.resolve();\n  console.log(2);\n}\nf();\nconsole.log(3);',
    options: ['1, 2, 3', '1, 3, 2', '3, 1, 2', '1, 2'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  await Promise.resolve();\n  console.log(2);\n}\nsetTimeout(() => console.log(3), 0);\nf();\nconsole.log(4);',
    options: ['1, 2, 4, 3', '1, 4, 3, 2', '1, 3, 4, 2', '1, 4, 2, 3'],
    correctIndex: 3,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function a() {\n  console.log(1);\n  await Promise.resolve();\n  console.log(2);\n}\nasync function b() {\n  console.log(3);\n  await Promise.resolve();\n  console.log(4);\n}\na();\nb();\nconsole.log(5);',
    options: ['1, 3, 5, 2, 4', '1, 2, 3, 4, 5', '1, 3, 2, 4, 5', '1, 5, 3, 2, 4'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve()\n  .then(() => console.log(1))\n  .then(() => console.log(2));\nsetTimeout(() => console.log(3), 0);\nconsole.log(4);',
    options: ['4, 3, 1, 2', '4, 1, 2, 3', '1, 2, 4, 3', '4, 1, 3, 2'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  Promise.resolve().then(() => console.log(2));\n}, 0);\nconsole.log(3);',
    options: ['1, 2, 3', '3, 2, 1', '3, 1, 2', '1, 3, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve().then(() => {\n  console.log(1);\n  setTimeout(() => console.log(2), 0);\n});\nconsole.log(3);',
    options: ['1, 2, 3', '3, 2, 1', '1, 3, 2', '3, 1, 2'],
    correctIndex: 3,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  Promise.resolve().then(() => console.log(2));\n}, 0);\nPromise.resolve().then(() => {\n  console.log(3);\n  setTimeout(() => console.log(4), 0);\n});\nconsole.log(5);',
    options: ['5, 1, 2, 3, 4', '5, 3, 1, 2, 4', '5, 3, 4, 1, 2', '5, 1, 3, 2, 4'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  queueMicrotask(() => console.log(2));\n}, 0);\nqueueMicrotask(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 3, 2, 1', '4, 1, 3, 2', '4, 3, 1, 2'],
    correctIndex: 3,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  await 0;\n  console.log(2);\n}\nconsole.log(3);\nf();\nconsole.log(4);',
    options: ['3, 1, 2, 4', '1, 3, 4, 2', '3, 1, 4, 2', '3, 4, 1, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve().then(() => console.log(1));\nqueueMicrotask(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['4, 2, 1, 3', '4, 1, 2, 3', '4, 1, 3, 2', '1, 2, 3, 4'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  await Promise.resolve();\n  console.log(2);\n}\nPromise.resolve().then(() => console.log(3));\nf();\nconsole.log(4);',
    options: ['1, 4, 2, 3', '1, 3, 4, 2', '1, 4, 3, 2', '3, 1, 4, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nsetTimeout(() => console.log(3), 0);\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 2, 3, 1', '4, 1, 3, 2', '4, 2, 1, 3'],
    correctIndex: 3,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => console.log(2), 0);\nnew Promise((resolve) => {\n  console.log(3);\n  resolve();\n}).then(() => console.log(4));\nconsole.log(5);',
    options: ['1, 3, 5, 4, 2', '1, 3, 5, 2, 4', '1, 2, 3, 4, 5', '1, 5, 3, 4, 2'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  return 2;\n}\nf().then((n) => console.log(n));\nconsole.log(3);',
    options: ['1, 2, 3', '1, 3, 2', '3, 1, 2', '2, 1, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nqueueMicrotask(() => {\n  console.log(2);\n  console.log(3);\n});\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 2, 3, 1', '2, 3, 4, 1', '4, 2, 1, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nasync function f() {\n  console.log(2);\n  await Promise.resolve();\n  console.log(3);\n}\nf();\nconsole.log(4);',
    options: ['2, 4, 1, 3', '2, 3, 4, 1', '2, 4, 3, 1', '4, 2, 3, 1'],
    correctIndex: 2,
  },
]

/** @type {Draft[]} */
const level2 = [
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve().then(() => {\n  console.log(1);\n  Promise.resolve().then(() => console.log(2));\n});\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 1, 3, 2', '4, 3, 1, 2', '1, 3, 2, 4'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'queueMicrotask(() => {\n  console.log(1);\n  queueMicrotask(() => console.log(2));\n});\nqueueMicrotask(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 3, 1, 2', '4, 1, 3, 2', '1, 3, 2, 4'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  Promise.resolve()\n    .then(() => console.log(2))\n    .then(() => console.log(3));\n}, 0);\nPromise.resolve().then(() => console.log(4));\nconsole.log(5);',
    options: ['5, 4, 1, 2, 3', '5, 1, 4, 2, 3', '5, 4, 1, 3, 2', '4, 5, 1, 2, 3'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nconst { port1, port2 } = new MessageChannel();\nport1.onmessage = () => console.log(2);\nport2.postMessage(null);\nconsole.log(3);',
    options: ['3, 1, 2', '3, 2, 1', '2, 3, 1', '1, 2, 3'],
    correctIndex: 1,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'const { port1, port2 } = new MessageChannel();\nport1.onmessage = () => console.log(1);\nport2.postMessage(null);\nPromise.resolve().then(() => console.log(2));\nconsole.log(3);',
    options: ['3, 1, 2', '1, 2, 3', '3, 2, 1', '2, 3, 1'],
    correctIndex: 2,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nrequestAnimationFrame(() => console.log(2));\nconsole.log(3);',
    options: ['3, 1, 2', '3, 2, 1', '2, 3, 1', '1, 2, 3'],
    correctIndex: 1,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nPromise.resolve().then(() => console.log(2));\nrequestAnimationFrame(() => console.log(3));\nconsole.log(4);',
    options: ['4, 2, 1, 3', '4, 3, 2, 1', '4, 2, 3, 1', '4, 1, 2, 3'],
    correctIndex: 2,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve().then(() => {\n  console.log(1);\n  setTimeout(() => console.log(2), 0);\n  Promise.resolve().then(() => console.log(3));\n});\nsetTimeout(() => console.log(4), 0);\nconsole.log(5);',
    options: ['5, 1, 3, 2, 4', '5, 1, 3, 4, 2', '5, 1, 4, 3, 2', '5, 4, 1, 3, 2'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  Promise.resolve().then(() => console.log(2));\n}, 0);\nsetTimeout(() => console.log(3), 0);\nPromise.resolve().then(() => {\n  console.log(4);\n  Promise.resolve().then(() => console.log(5));\n});\nconsole.log(6);',
    options: ['6, 4, 5, 1, 2, 3', '6, 4, 1, 5, 2, 3', '6, 1, 2, 4, 5, 3', '6, 4, 5, 1, 3, 2'],
    correctIndex: 0,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => console.log(1), 0);\nconst { port1, port2 } = new MessageChannel();\nport1.onmessage = () => {\n  console.log(2);\n  Promise.resolve().then(() => console.log(3));\n};\nPromise.resolve().then(() => console.log(4));\nport2.postMessage(null);\nconsole.log(5);',
    options: ['5, 4, 1, 2, 3', '5, 2, 4, 3, 1', '5, 4, 2, 3, 1', '5, 4, 2, 1, 3'],
    correctIndex: 2,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  await Promise.resolve();\n  console.log(2);\n  await Promise.resolve();\n  console.log(3);\n}\nf();\nPromise.resolve().then(() => console.log(4));\nconsole.log(5);',
    options: ['1, 5, 2, 3, 4', '1, 5, 4, 2, 3', '1, 5, 2, 4, 3', '1, 2, 5, 4, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve()\n  .then(() => {\n    console.log(1);\n    return Promise.resolve();\n  })\n  .then(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 1, 3, 2', '4, 3, 1, 2', '1, 3, 2, 4'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'Promise.resolve()\n  .then(() => {\n    console.log(1);\n  })\n  .then(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 1, 3, 2', '4, 3, 1, 2', '1, 2, 3, 4'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  setTimeout(() => console.log(2), 0);\n  Promise.resolve().then(() => console.log(3));\n}, 0);\nPromise.resolve().then(() => console.log(4));\nconsole.log(5);',
    options: ['5, 4, 1, 2, 3', '5, 1, 4, 3, 2', '5, 4, 1, 3, 2', '5, 4, 3, 1, 2'],
    correctIndex: 2,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  const { port1, port2 } = new MessageChannel();\n  port1.onmessage = () => console.log(2);\n  port2.postMessage(null);\n  console.log(3);\n}, 0);\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 1, 3, 2', '4, 3, 1, 2', '1, 3, 2, 4'],
    correctIndex: 1,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'setTimeout(() => {\n  console.log(1);\n  requestAnimationFrame(() => console.log(2));\n  Promise.resolve().then(() => console.log(3));\n}, 0);\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 1, 3, 2', '4, 3, 1, 2', '1, 3, 2, 4'],
    correctIndex: 1,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'queueMicrotask(() => {\n  console.log(1);\n  queueMicrotask(() => {\n    console.log(2);\n    queueMicrotask(() => console.log(3));\n  });\n});\nqueueMicrotask(() => console.log(4));\nconsole.log(5);',
    options: ['5, 1, 2, 4, 3', '5, 1, 4, 2, 3', '5, 1, 2, 3, 4', '5, 4, 1, 2, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'const a = new MessageChannel();\nconst b = new MessageChannel();\na.port1.onmessage = () => console.log(1);\nb.port1.onmessage = () => console.log(2);\na.port2.postMessage(null);\nb.port2.postMessage(null);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
    options: ['4, 1, 2, 3', '4, 3, 2, 1', '4, 1, 3, 2', '4, 3, 1, 2'],
    correctIndex: 3,
    skipVerify: true,
  },
  {
    type: 'code',
    language: 'js',
    text: 'async function f() {\n  console.log(1);\n  await Promise.resolve();\n  console.log(2);\n  setTimeout(() => console.log(3), 0);\n}\nf();\nsetTimeout(() => console.log(4), 0);\nconsole.log(5);',
    options: ['1, 5, 2, 3, 4', '1, 5, 2, 4, 3', '1, 2, 5, 4, 3', '1, 5, 4, 2, 3'],
    correctIndex: 1,
  },
  {
    type: 'code',
    language: 'js',
    text: 'console.log(1);\nsetTimeout(() => {\n  console.log(2);\n  Promise.resolve().then(() => console.log(3));\n}, 0);\nPromise.resolve().then(() => {\n  console.log(4);\n  setTimeout(() => console.log(5), 0);\n});\nqueueMicrotask(() => console.log(6));\nconsole.log(7);',
    options: ['1, 7, 4, 6, 2, 3, 5', '1, 7, 6, 4, 2, 3, 5', '1, 7, 4, 6, 2, 5, 3', '1, 4, 6, 7, 2, 3, 5'],
    correctIndex: 0,
  },
]

function withIds(drafts, startId) {
  return drafts.map((draft, index) => {
    const { skipVerify, ...question } = draft
    return {
      id: startId + index,
      ...question,
      skipVerify,
    }
  })
}

const levels = assignSequentialIds([
  { level: 'junior', drafts: level0 },
  { level: 'middle', drafts: level1 },
  { level: 'senior', drafts: level2 },
])

function assignSequentialIds(packs) {
  let nextId = 1

  return packs.map(({ level, drafts }) => {
    const questions = withIds(drafts, nextId)
    nextId += drafts.length
    return { level, questions }
  })
}

function collectLogs(source) {
  return new Promise((resolve, reject) => {
    const logs = []
    const context = vm.createContext({
      console: {
        log(value) {
          logs.push(String(value))
        },
      },
      setTimeout,
      Promise,
      queueMicrotask,
      MessageChannel,
    })

    try {
      vm.runInContext(source, context)
    } catch (error) {
      reject(error)
      return
    }

    setTimeout(() => resolve(logs.join(', ')), 30)
  })
}

async function verify() {
  const mismatches = []

  for (const { questions } of levels) {
    for (const question of questions) {
      if (question.skipVerify) {
        continue
      }

      const actual = await collectLogs(question.text)
      const expected = question.options[question.correctIndex]

      if (actual !== expected) {
        mismatches.push({ id: question.id, expected, actual })
      }
    }
  }

  if (mismatches.length > 0) {
    console.error(mismatches)
    throw new Error(`Verification failed for ${mismatches.length} questions`)
  }
}

function toPublicQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    language: question.language,
    text: question.text,
    options: question.options,
    correctIndex: question.correctIndex,
  }
}

async function writePacks() {
  await mkdir(packsDir, { recursive: true })

  for (const { level, questions } of levels) {
    const publicQuestions = questions.map(toPublicQuestion)

    for (const locale of ['ru', 'en']) {
      const pack = {
        stack: 'js',
        topic: 'event-loop',
        level,
        locale,
        questions: publicQuestions,
      }

      await writeFile(
        path.join(packsDir, `level-${level}-${locale}.json`),
        `${JSON.stringify(pack, null, 2)}\n`,
        'utf8',
      )
    }
  }

  const lastId = levels
    .flatMap(({ questions }) => questions)
    .reduce((max, question) => Math.max(max, question.id), 0)

  await writeFile(
    path.join(rootDir, 'public/packs/last-id.json'),
    `${JSON.stringify({ lastId }, null, 2)}\n`,
    'utf8',
  )
}

await verify()
await writePacks()
console.log('Wrote 6 event-loop packs')
