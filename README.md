# Домашнее задание ШРИ 2019 JS

## Описание

> *Node version*: v12.7.0+

Необходимо написать полифил для ES6 Promise.

Код полифила описан в файле `polyfill.js`. Протестировал работу, используя [Promises/A+ Compliance Test Suite](https://github.com/promises-aplus/promises-tests).

Для запуска тестов:

```
node test
```

## Что сделано

- [x] Promise.prototype.then()
- [x] Promise.prototype.catch()
- [x] Promise.resolve()
- [x] Promise.reject()
- [x] Обработка thenable объектов
- [x] Соответствие Promise/A+
