<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback;
use Symfony\Component\HttpFoundation\Response;

/**
 * Pops up an error dialog back to the client's browser
 *
 * @author Colin Morelli
 * @since September 25th, 2012
 */
class ErrorCallback extends AbstractCallback
{
	protected $content;
	
	/**
	 * Constructor method accepts the content of the dialog
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $message = '' )
	{
		$this->setContent( $message );
	}

	/**
	 * Sets the content of the dialog
	 *
	 * @access public
	 * @param mixed $content
	 * @return void
	 */
	public function setContent( $content )
	{
		$this->content = $content;
	}

	/**
	 * Gets the content of the dialog
	 *
	 * @access public
	 * @return string
	 */
	public function getContent( )
	{
		return $this->content;
	}

	/**
	 * Prepares the parameters to pass back to the client
	 *
	 * @access protected
	 * @return array
	 */
	protected function prepareParameters( )
	{
		return array( $this->content );
	}
}