'use strict';

// Export

module.exports = ( task, core ) => {


	let imports = {};
  let common = '/styles/common' + core.config.extnames.styles;
  let relative = core.path.relative( core.path.TEMP, core.path.BLOCKS );


	// Check files

	Object.keys( core.tree ).forEach( ( page ) => {

		if ( ( ! core.config.options.cssBundles || core.isDevelopment ) && page !== 'app' ) return;

		if ( ! imports[page] ) imports[page] = [];

		Object.keys( core.tree[page] ).forEach( ( key ) => {

			let block = core.bem.getBlock( key );

			core.levels.forEach( ( level ) => {

				let el = core.path.join( level, block, key + core.config.extnames.styles ),
					css = core.path.join( level, block, `${key}.css` );

				if ( core.checkFile( core.path.blocks( el ) ) ) {

					let file = core.path.join( relative, el );

						if ( imports[ page ].indexOf( file ) === -1 ) imports[ page ].push( file );
				}

				if ( core.config.extnames.styles !== '.css' && core.checkFile( core.path.blocks( css ) ) ) {

					let file = core.path.join( relative, css );

						if ( imports[ page ].indexOf( file ) === -1 ) imports[ page ].push( file );
				}

				core.tree[page][key].forEach( ( mod ) => {

					let elMod = core.path.join( level, block, mod + core.config.extnames.styles ),
						cssMod = core.path.join( level, block, `${mod}.css` );

					if ( core.checkFile( core.path.blocks( elMod ) ) ) {

						let file = core.path.join( relative, elMod );

							if ( imports[ page ].indexOf( file ) === -1 ) imports[ page ].push( file );
					}

					if ( core.config.extnames.styles !== '.css' && core.checkFile( core.path.blocks( cssMod ) ) ) {

						let file = core.path.join( relative, cssMod );

							if ( imports[ page ].indexOf( file ) === -1 ) imports[ page ].push( file );
					}

				});

			});

		});

	});


	// Check common

	common = core.checkFile( core.path.assets( common ) ) ? `@import '${core.path.assets( common )}';` : false;

	// Write files

	Object.keys( imports ).forEach( ( page ) => {

		let content = ( typeof common === 'string' ) ? common.replace( /\\/g, '\/' ) : '',
			file = core.path.temp( page + core.config.extnames.styles );

			imports[page].forEach( ( key ) => {

					content += `${content === '' ? '' : '\n'}@import '${key.replace( /\\/g, '\/' )}';`;
			});

			core.writeFile( file, content );

	});


	return ( cb ) => cb();


};
