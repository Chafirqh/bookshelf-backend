const { nanoid } = require('nanoid');
const books = require('./books');

// Menambahkan buku
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  if (!name || readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: `Gagal menambahkan buku. ${
        !name ? 'Mohon isi nama buku' : 'readPage tidak boleh lebih besar dari pageCount'
      }`,
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);
  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};
// Mendapatkan semua data buku
const getAllBooksHandler = (request, h) => {
  const { query } = request;
  let filteredBooks = [...books];

  if (query.name) {
    const searchName = query.name.toLowerCase();
    filteredBooks = filteredBooks.filter(
      (book) => book.name.toLowerCase().includes(searchName),
    );
  }

  if (query.reading === '0' || query.reading === '1') {
    const readingValue = query.reading === '1';
    filteredBooks = filteredBooks.filter(
      (book) => book.reading === readingValue,
    );
  }

  if (query.finished === '0' || query.finished === '1') {
    const finishedValue = query.finished === '1';
    filteredBooks = filteredBooks.filter(
      (book) => book.finished === finishedValue,
    );
  }

  const response = {
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  };

  return h.response(response).code(200);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const book = books.find((bk) => bk.id === id);

  return book !== undefined
    ? {
      status: 'success',
      data: { book },
    }
    : h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    }).code(404);
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const response = (!name || readPage > pageCount)
    ? h.response({
      status: 'fail',
      message: `Gagal memperbarui buku. ${!name ? 'Mohon isi nama buku' : 'readPage tidak boleh lebih besar dari pageCount'
      }`,
    }).code(400)
    : (() => {
      const updatedAt = new Date().toISOString();
      const index = books.findIndex((book) => book.id === id);

      if (index !== -1) {
        books[index] = {
          ...books[index],
          name,
          year,
          author,
          summary,
          publisher,
          pageCount,
          readPage,
          finished: pageCount === readPage,
          reading,
          updatedAt,
        };

        return h.response({
          status: 'success',
          message: 'Buku berhasil diperbarui',
        }).code(200);
      }

      return h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      }).code(404);
    })();

  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex((book) => book.id === id);

  return index !== -1
    ? (() => {
      books.splice(index, 1);
      return h.response({
        status: 'success',
        message: 'Buku berhasil dihapus',
      }).code(200);
    })()
    : h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
