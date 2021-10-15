import React, { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/solid'
import Modal from '../Modal'
import Button from '../Button'
import { ModalProps } from '../../types/types'

const ProductModal = ({ isOpen, onClose, children }: ModalProps) => {
  const [settingsView, setSettingsView] = useState('')
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {settingsView !== '' ? (
        <button
          className="absolute default-transition flex items-center left-2 text-th-fgd-3 text-xs top-3 focus:outline-none hover:text-th-fgd-1"
          onClick={() => setSettingsView('')}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span>Back</span>
        </button>
      ) : null}
      <Modal.Header>
        <div>Settings</div>
      </Modal.Header>
      {!settingsView ? (
        <div className="border-b border-th-bkg-4">
          <button
            className="border-t border-th-bkg-4 default-transition flex font-normal items-center justify-between py-3 text-th-fgd-1 w-full hover:text-th-primary focus:outline-none"
            onClick={() => setSettingsView('Default Market')}
          >
            <span>Default Market</span>
            <div className="flex items-center text-th-fgd-3 text-xs">
              name of product
              <ChevronRightIcon className="h-5 ml-1 w-5 text-th-primary" />
            </div>
          </button>
          <button
            className="border-t border-th-bkg-4 default-transition flex font-normal items-center justify-between py-3 text-th-fgd-1 w-full hover:text-th-primary focus:outline-none"
            onClick={() => setSettingsView('RPC Endpoint')}
          >
            <span>RPC Endpoint</span>
            <div className="flex items-center text-th-fgd-3 text-xs">
              rpcEndpoint.label
              <ChevronRightIcon className="h-5 ml-1 w-5 text-th-primary" />
            </div>
          </button>
        </div>
      ) : null}
      <div className="flex justify-center pt-6">
        <Button onClick={onClose}>Done</Button>
      </div>
    </Modal>
  )
}

export default React.memo(ProductModal)
