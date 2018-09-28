/*
TODO: Needs Review and Spec
*/
var fs = require('fs');
var path = require('path');

var media = {
	upload (filePath, cb, options) {
		var id = options.id || '';
		let result = {};
		if (filePath) {
			var splittedFilePath = filePath.split('/');
			var tempFilename = splittedFilePath.pop();
			var extension = tempFilename.substr(tempFilename.lastIndexOf('.'));
			var filename = id ? (id + extension) : tempFilename;
			fs.rename(filePath, path.join(__dirname, '../../public/media/images/' + filename), function (err) {
				if (err) {
					result.error = err;
				} else {
					result.url = '/media/images/' + filename;
				}

				if (cb) {
					cb(result);
				}
			});
		} else {
			result.error = new Error('File not found');
			if (cb) {
				cb(result);
			}
		}
	},
	getAll (pathPrefix, cb) {
		fs.readdir(path.join(__dirname, '../../public/media/images/'), function (err, files) {
			if (err) {
				console.log(err);
			}

			var result = files.map(function (file) {
				return {
					title: file.substring(0, file.lastIndexOf('.')),
					value: '/' + pathPrefix + '/media/images/' + file,
				};
			});

			if (cb) {
				cb(result);
			}
		});
	},
};

module.exports = {
	upload: function (req, res) {
		var keystone = req.keystone;

		if (req.files && req.files.file) {
			var options = {};

			if (keystone.get('wysiwyg media images filenameAsPublicID')) {
				options.id = req.files.file.originalname.substring(0, req.files.file.originalname.lastIndexOf('.'));
			}

			media.upload(req.files.file.path, function (result) {
				var sendResult = function () {
					if (result.error) {
						res.send({ error: { message: result.error.message } });
					} else {
						res.send({ image: { url: '/' + (keystone.get('admin path') || 'keystone') + result.url } });
					}
				};

				// TinyMCE upload plugin uses the iframe transport technique
				// so the response type must be text/html
				res.format({
					html: sendResult,
					json: sendResult,
				});
			}, options);
		} else {
			res.json({ error: { message: 'No image selected' } });
		}
	},
	getAll: function (req, res) {
		const pathPrefix = req.keystone.get('admin path') || 'keystone';
		media.getAll(pathPrefix, function (result) {
			res.json(result);
		});
	},
};
