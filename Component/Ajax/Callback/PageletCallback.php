<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback;

/**
 * This allows you to display a backbone view triggered via a JSON response
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class PageletCallback extends AbstractCallback
{
	protected $parameters;
	protected $name;
	protected $method;

	const METHOD_REFRESH = 'refresh';
	
	/**
	 * Constructot takes whatever parameters are necessary to return the completed response
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $name, $method )
	{
		$this->setName( $name );
		$this->setMethod( $method );
	}

	/**
	 * Set the redirect location
	 *
	 * @access public
	 * @param string $location
	 * @return void
	 */
	public function setName( $name )
	{
		$this->name = $name;
	}

	/**
	 * Gets the redirect location
	 *
	 * @access public
	 * @return string
	 */
	public function getName( )
	{
		return $this->name;
	}

	public function setMethod( $method )
	{
		$this->method = $method;
	}

	public function getMethod( )
	{
		return $this->method;
	}

	/**
	 * Prepares parameters for the client
	 *
	 * @access protected
	 * @return array
	 */
	protected function prepareParameters( )
	{
		return array( $this->name, $this->method );
	}
}