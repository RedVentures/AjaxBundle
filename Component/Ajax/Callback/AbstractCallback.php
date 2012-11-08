<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback;

/**
 * All callback classes should extend this base class providing some basic functionality
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
abstract class AbstractCallback
{
	protected $callback;
	protected $parameters;

	/**
	 * Gets the callback array to send back
	 *
	 * @access public
	 * @return array
	 */
	public function getRepresentation( )
	{
		$class = explode( '\\', get_class( $this ) );
		return array( 'callback' => strtolower( preg_replace( '/Callback$/', '', end( $class ) ) ), 'arguments' => $this->prepareParameters( ) );
	}

	/**
	 * Prepares parameters to send back
	 *
	 * @access protected
	 * @return array
	 */
	abstract protected function prepareParameters( );
}