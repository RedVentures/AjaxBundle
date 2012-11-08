<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Callback;
use Symfony\Component\HttpFoundation\Response;

/**
 * This allows you to display a backbone view triggered via a JSON response
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class InjectCallback extends AbstractCallback
{
	protected $content;
	
	/**
	 * Constructor method accepts the content of the dialog
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $content = '', $target = false )
	{
		$this->setContent( $content );
		$this->setTarget( $target );
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
	 * Returns the content
	 *
	 * @access public
	 * @return string
	 */
	public function getContent( )
	{
		return $this->content;
	}

	/**
	 * Sets the target of the dialog
	 *
	 * @access public
	 * @param mixed $target
	 * @return void
	 */
	public function setTarget( $target )
	{
		$this->target = $target;
	}

	/**
	 * Returns the target
	 *
	 * @access public
	 * @return string
	 */
	public function getTarget( )
	{
		return $this->target;
	}

	/**
	 * Prepares parameters for representation
	 *
	 * @access public
	 * @return array
	 */
	protected function prepareParameters( )
	{
		return array( $this->content, $this->target );
	}
}