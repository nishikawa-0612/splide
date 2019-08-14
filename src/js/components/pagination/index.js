/**
 * The component for handling pagination
 *
 * @author    Naotoshi Fujita
 * @copyright Naotoshi Fujita. All rights reserved.
 */

import { create, addClass, removeClass } from '../../utils/dom';
import { subscribe } from '../../utils/dom';
import { STATUS_CLASSES } from '../../constants/classes';

/**
 * The event name for updating some attributes of pagination nodes.
 *
 * @type {string}
 */
const ATTRIBUTES_UPDATE_EVENT = 'move.page';

/**
 * The event name for "update".
 *
 * @type {string}
 */
const UPDATE_EVENT = 'updated.page';


/**
 * The component for handling pagination
 *
 * @param {Splide} Splide     - A Splide instance.
 * @param {Object} Components - An object containing components.
 * @param {string} name       - A component name as a lowercase string.
 *
 * @return {Object} - The component object.
 */
export default ( Splide, Components, name ) => {
	/**
	 * Store all data for pagination.
	 * - list: A list element.
	 * - items: An array that contains objects(li, button, index, page).
	 *
	 * @type {Object}
	 */
	let data = {};

	/**
	 * Pagination component object.
	 *
	 * @type {Object}
	 */
	const Pagination = {
		/**
		 * Required only when the pagination option is true.
		 *
		 * @type {boolean}
		 */
		required: Splide.options.pagination,

		/**
		 * Called when the component is mounted.
		 */
		mount() {
			data = createPagination();

			const root = Splide.root;

			if ( Splide.options.pagination === 'top' ) {
				root.insertBefore( data.list, Components.Elements.track );
			} else {
				root.appendChild( data.list );
			}

			bind();
		},

		/**
		 * Called after all components are mounted.
		 */
		mounted() {
			const index = Splide.index;

			Splide.emit( `${ name }:mounted`, data, this.getItem( index ) );
			update( index, -1 );
		},

		/**
		 * Destroy the pagination.
		 * Be aware that node.remove() is not supported by IE.
		 */
		destroy() {
			if ( data && data.list ) {
				Splide.root.removeChild( data.list );
			}

			Splide.off( ATTRIBUTES_UPDATE_EVENT );
			data = null;
		},

		/**
		 * Return an item by index.
		 *
		 * @param {number} index - A slide index.
		 *
		 * @return {Object|undefined} - An item object on success or undefined on failure.
		 */
		getItem( index ) {
			return data.items[ Components.Controller.indexToPage( index ) ];
		},

		/**
		 * Return object containing pagination data.
		 *
		 * @return {Object} - Pagination data including list and items.
		 */
		get data() {
			return data;
		},
	};

	/**
	 * Listen some events.
	 */
	function bind() {
		Splide
			.on( ATTRIBUTES_UPDATE_EVENT, update )
			.on( UPDATE_EVENT, () => {
				Pagination.destroy();

				if ( Splide.options.pagination ) {
					Pagination.mount();
					Pagination.mounted();
				}
			} );
	}

	/**
	 * Update attributes.
	 *
	 * @param {number} index     - Active index.
	 * @param {number} prevIndex - Prev index.
	 */
	function update( index, prevIndex ) {
		const prev = Pagination.getItem( prevIndex );
		const curr = Pagination.getItem( index );

		if ( prev ) {
			removeClass( prev.button, STATUS_CLASSES.active );
		}

		if ( curr ) {
			addClass( curr.button, STATUS_CLASSES.active );
		}

		Splide.emit( `${ name }:updated`, data, prev, curr );
	}

	/**
	 * Create a wrapper and button elements.
	 *
	 * @return {Object} - An object contains all data.
	 */
	function createPagination() {
		const options = Splide.options;
		const classes = Splide.classes;
		const list    = create( 'ul', { class: classes.pagination } );
		const Slides  = Components.Slides;

		const items = Slides.getSlides( false, true )
			.filter( Slide => options.focus !== false || Slide.index % options.perPage === 0 )
			.map( ( Slide, page ) => {
				const li      = create( 'li', {} );
				const button  = create( 'button', { class: classes.page } );

				li.appendChild( button );
				list.appendChild( li );

				subscribe( button, 'click', () => { Splide.go( `>${ page }` ) } );

				return { li, button, page, Slides: Slides.getSlidesByPage( page ) };
			} );

		return { list, items };
	}

	return Pagination;
}