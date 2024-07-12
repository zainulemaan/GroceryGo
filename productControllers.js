const multer = require('multer');
const AppError = require('../utils/appError');
const Product = require('./../models/productModels');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/products');
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    cb(null, `product-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('PLz Uplaod Only Images.\nThanks!', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadProductPhotos = upload.single('photo');

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = 1;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,description';
  next();
};

exports.getAllProducts = catchAsync(async (req, res) => {
  const features = new APIFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const products = await features.query;

  res.status(200).json({
    status: 'success',
    result: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError('No Product Is Found With That Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError('No Product Is Found With That Id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }
  console.log(req.file);
  console.log(req.body);
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      product: newProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError('No Product Is Found With That Id', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getProductStats = catchAsync(async (req, res) => {
  const stats = await Product.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $addFields: {
        yearCreated: { $year: '$createdAt' },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$category' },
        num: { $sum: 1 },
        yearCreated: { $first: '$yearCreated' },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { avgPrice: 1 } },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.below500Products = catchAsync(async (req, res) => {
  const below500 = await Product.aggregate([
    {
      $match: {
        price: { $gte: 1, $lt: 1000 } 
      }
    },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 100, 500, 1000],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              category: '$category',
              quantity: '$quatityAvailable',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      below500,
    },
  });
});

// Filter products by category "dairy" or "bakery"
exports.getDairyProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  // const selectedBrand = req.query.brand;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'dairy' }, { category: 'bakery' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['bakery', 'dairy'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quantityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;

  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }

  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  // console.log(brand);
  const Dairy = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Dairy,
    },
  });
});

// Fruit & vegetables

exports.getFruitProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'fruits' }, { category: 'vegetables' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['fruits', 'vegetables'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Fruits = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Fruits,
    },
  });
});

// BreakFast Essentials

exports.getMeatProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'meat' }, { category: 'seafood' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['meat', 'seafood'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Meat = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Meat,
    },
  });
});

exports.getStationeryProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'stationery' }, { category: 'homecare' }],
      },
    },

    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['homecare', 'stationery'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Stationery = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Stationery,
    },
  });
});

exports.getSnacksProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'snacks' }, { category: 'colddrinks' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['colddrinks', 'snacks'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Snacks = await Product.aggregate(pipeline);
  res.status(200).json({
    status: 'success',
    data: {
      Snacks,
    },
  });
});

exports.getBabyCareProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'health' }, { category: 'babycarehealt' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['babycarehealt', 'health'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];

  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }

  const Babycare = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      Babycare,
    },
  });
});

exports.getPetcareProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'petcare' }, { category: 'vet' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['petcare', 'vet'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const Petcare = await Product.aggregate(pipeline);
  res.status(200).json({
    status: 'success',
    data: {
      Petcare,
    },
  });
});

exports.getBreakFastProducts = catchAsync(async (req, res) => {
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const pipeline = [
    {
      $match: {
        $or: [{ category: 'breakfast' }, { category: 'dinner' }],
      },
    },
    {
      $sort: { price: sortOrder },
    },
    {
      $bucket: {
        groupBy: '$category',
        boundaries: ['breakfast', 'dinner'],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          products: {
            $push: {
              name: '$name',
              price: '$price',
              description: '$description',
              quantity: '$quatityAvailable',
              discountPercentage: '$discountPercentage',
              brand: '$brand',
              size: '$size',
              photo: '$photo',
            },
          },
        },
      },
    },
  ];
  const brand = req.query.brand;
  const size = req.query.size;
  if (brand) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.brand': brand,
      },
    });
  }
  if (size) {
    pipeline.push({
      $unwind: '$products',
    });
    pipeline.push({
      $match: {
        'products.size': size,
      },
    });
  }
  const BreakFast = await Product.aggregate(pipeline);

  res.status(200).json({
    status: 'success',
    data: {
      BreakFast,
    },
  });
});
