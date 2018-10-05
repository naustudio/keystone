module.exports = function initMediaCollection (keystone) {
	var { Types } = keystone.Field;

	var mediaPath = keystone.get('mediaPath');
	var mediaPublicPath = keystone.get('mediaPublicPath');

	if (!mediaPath || !mediaPublicPath) {
		return;
	}

	var Media = new keystone.List('Media', {
		isMediaCollection: true,
		map: { name: 'name' },
		autokey: { from: 'name', path: 'slug', unique: true },
		defaultSort: '-createdAt',
	});

	Media.add({
		name: {
			initial: true,
			type: Types.Text,
			label: 'Name',
		},
		altText: {
			initial: true,
			type: Types.Text,
			label: 'Alt text',
		},
		caption: {
			initial: true,
			type: Types.Text,
			label: 'Caption',
		},
		file: {
			required: true,
			initial: true,
			type: Types.File,
			storage: new keystone.Storage({
				adapter: keystone.Storage.Adapters.FS,
				fs: {
					path: keystone.expandPath(mediaPath),
					publicPath: mediaPublicPath,
					whenExists: 'overwrite',
					generateFilename: function (options) {
						return options.originalname;
					},
				},
				schema: { url: true },
			}),
			label: 'File',
		},
		createdAt: {
			type: Types.Date,
			default: Date.now,
			label: 'Created At',
		},
	});

	Media.defaultColumns = 'name, file, caption';
	Media.register();
};
