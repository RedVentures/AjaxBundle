<?php
namespace RedVentures\Bundle\AjaxBundle\Component\Ajax\Response;
use Symfony\Component\HttpFoundation\Response;

/**
 * This allows you to display a dialog triggered via a JSON response
 *
 * @author Colin Morelli
 * @since July 25th, 2012
 */
class FormResponse extends AbstractResponse
{
	protected $form;
	
	/**
	 * Constructor method accepts the content of the dialog
	 *
	 * @access public
	 * @return void
	 */
	public function __construct( $form )
	{
		$this->setForm( $form );
	}

	/**
	 * Sets the content of the dialog
	 *
	 * @access public
	 * @param mixed $content
	 * @return void
	 */
	public function setForm( $form )
	{
		$this->form = $form;
	}

	/**
	 * Prepares the parameters to pass back to the client
	 *
	 * @access protected
	 * @return array
	 */
	public function getContent( )
	{
		$errorArray = $this->getFormErrors( $this->form );

		// Loop over all children
		return array( 'name' => $this->form->getName(), 'result' => array( 'valid' => $this->form->isValid(), 'errors' => $errorArray ) );
	}

	protected function getFormErrors( $form )
	{
		$errorArray = array( 'errors' => array(), 'children' => array(), 'name' => $form->getName() );

		foreach ( $form->getErrors( ) as $error ) {
			$errorArray['errors'][] = $error->getMessageTemplate( );
		}

		// Loop all children
		foreach ( $form->getChildren() as $child ) {
			$errorArray['children'][] = $this->getFormErrors( $child );
		}

		// Return the completed error array
		return $errorArray;
	}
}