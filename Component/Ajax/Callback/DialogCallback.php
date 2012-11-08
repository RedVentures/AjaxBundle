<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback;
use Symfony\Component\HttpFoundation\Response;

/**
 * This allows you to display a dialog triggered via a JSON response
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class DialogCallback extends AbstractCallback
{
	protected $content;
	
	/**
	 * Constructor method accepts the content of the dialog
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $content = '' )
	{
		$this->setContent( $content );
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