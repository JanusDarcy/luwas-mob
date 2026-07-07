'use client'

import { useState } from 'react'
import { Dialog } from '@headlessui/react'
import { AlertTriangle, X, Calendar, DollarSign, Heart, Lightbulb, Star, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import type { TravelRecord } from '@/types/travel'

interface CancellationModalProps {
isOpen: boolean
onClose: () => void
onConfirm: (reason: string, details?: string) => Promise<void>
bookingTitle: string
booking?: TravelRecord | null
isLoading?: boolean
}

const CANCELLATION_REASONS = [
{ id: 'plans_changed', label: 'My plans have changed', icon: Calendar },
{ id: 'financial', label: 'Financial reasons', icon: DollarSign },
{ id: 'emergency', label: 'Health/Family emergency', icon: Heart },
{ id: 'better_option', label: 'Found a better alternative', icon: Lightbulb },
{ id: 'quality', label: 'Service quality concerns', icon: Star },
{ id: 'other', label: 'Other reason', icon: MessageSquare },
]

export default function CancellationModal({
isOpen,
onClose,
onConfirm,
bookingTitle,
booking,
isLoading = false,
}: CancellationModalProps) {
const [selectedReason, setSelectedReason] = useState<string | null>(null)
const [otherDetails, setOtherDetails] = useState('')
const [error, setError] = useState<string | null>(null)
const [success, setSuccess] = useState(false)

const handleConfirm = async () => {
if (!selectedReason) {
setError('Please select a reason for cancellation')
return
}

    if (selectedReason === 'other' && !otherDetails.trim()) {
      setError('Please provide details for your cancellation')
      return
    }

    try {
      setError(null)
      const reasonLabel = CANCELLATION_REASONS.find(r => r.id === selectedReason)?.label || selectedReason
      await onConfirm(reasonLabel, otherDetails || undefined)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSelectedReason(null)
        setOtherDetails('')
        setSuccess(false)
      }, 1500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking'
      setError(errorMessage)
    }

}

return (
<Dialog open={isOpen} onClose={onClose} className="relative z-50">
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 space-y-6 overflow-y-auto max-h-[90vh]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold text-gray-900">
                  Cancel Booking
                </Dialog.Title>
                <p className="text-sm text-gray-600 mt-1">{bookingTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-200">
                  <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-green-900">Booking cancelled successfully</p>
                <p className="text-sm text-green-700">Your booking has been cancelled and will be removed from your history.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {!success && (
            <>
              {booking && (
                <div className="bg-gray-50 rounded-lg p-5 space-y-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 text-lg">Booking Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Destination</p>
                      <p className="text-gray-900 font-medium mt-1">
                        {booking.type === 'trip' ? booking.destination : booking.type === 'itinerary' ? booking.title : booking.promoTitle}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</p>
                      <p className="text-gray-900 font-medium mt-1">{booking.departureDate || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Total Price</p>
                      <p className="text-gray-900 font-medium mt-1">₱{(booking.finalPrice ?? booking.totalPrice ?? 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</p>
                      <p className="text-gray-900 font-medium mt-1 capitalize">{booking.status}</p>
                    </div>
                  </div>
                  {booking.proofUrl && (
                    <div className="pt-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Receipt</p>
                      <Image
                        src={booking.proofUrl}
                        alt="Receipt"
                        width={300}
                        height={200}
                        className="rounded-lg border border-gray-300 object-contain max-w-full"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-orange-800">
                  <strong>Important:</strong> Cancelling this booking cannot be undone. Please help us improve by selecting a reason below.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                  Cancellation Reason <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {CANCELLATION_REASONS.map(reason => {
                    const Icon = reason.icon
                    return (
                      <button
                        key={reason.id}
                        onClick={() => {
                          setSelectedReason(reason.id)
                          setError(null)
                        }}
                        disabled={isLoading}
                        className={`p-4 rounded-lg border-2 transition text-left flex items-center gap-4 disabled:opacity-50 ${
                          selectedReason === reason.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 ${selectedReason === reason.id ? 'text-red-600' : 'text-gray-400'}`} />
                        <span className={selectedReason === reason.id ? 'font-semibold text-red-700' : 'text-gray-700'}>
                          {reason.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedReason === 'other' && (
                <div className="space-y-3">
                  <label htmlFor="details" className="block text-sm font-semibold text-gray-900">
                    Additional Details <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="details"
                    value={otherDetails}
                    onChange={e => setOtherDetails(e.target.value)}
                    placeholder="Please provide more information about your cancellation..."
                    disabled={isLoading}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none disabled:bg-gray-100 text-sm"
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-6 border-t">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-5 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading || !selectedReason}
                  className={`flex-1 px-5 py-3 text-white font-semibold rounded-lg transition ${
                    isLoading || !selectedReason
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {isLoading ? 'Processing...' : 'Confirm Cancellation'}
                </button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>

)
}
