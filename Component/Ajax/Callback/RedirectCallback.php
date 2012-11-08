<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback;

/**
 * This allows you to display a backbone view triggered via a JSON response
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class RedirectCallback extends AbstractCallback
{
	protected $parameters;
	protected $download;
	protected $location;
	
	/**
	 * Constructot takes whatever parameters are necessary to return the completed response
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $location = null, $download = false )
	{
		$this->setLocation( $location );
		$this->setDownload( $download );
	}

	/**
	 * Set the redirect location
	 *
	 * @access public
	 * @param string $location
	 * @return void
	 */
	public function setLocation( $location )
	{
		$this->location = $location;
	}

	/**
	 * Gets the redirect location
	 *
	 * @access public
	 * @return string
	 */
	public function getLocation( )
	{
		return $this->location;
	}
	
	public function setDownload( $download )
	{
		$this->download = !!$download;
	}
	
	public function getDownload( )
	{
		return $this->download;
	}

	/**
	 * Prepares parameters for the client
	 *
	 * @access protected
	 * @return array
	 */
	protected function prepareParameters( )
	{
		return array( $this->location, $this->download );
	}
}