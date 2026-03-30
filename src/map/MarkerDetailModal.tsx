import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import styles from './MarkerDetailModal.module.css';

export interface MarkerDetail {
  title: string;
  longitude: number;
  latitude: number;
  imgUrl?: string;
}

interface MarkerDetailModalProps {
  detail: MarkerDetail | null;
  onClose: () => void;
}

const MarkerDetailModal = ({ detail, onClose }: MarkerDetailModalProps) => (
  <Dialog open={detail !== null} onClose={onClose}>
    <DialogBackdrop className={styles.backdrop} />

    <div className={styles.modalWrap}>
      <DialogPanel className={styles.panel}>
        {detail?.imgUrl && <img src={detail.imgUrl} alt={detail.title} className={styles.image} />}

        <DialogTitle className={styles.title}>{detail?.title ?? 'Marker'}</DialogTitle>

        <button type="button" onClick={onClose} className={styles.closeButton}>
          Close
        </button>
      </DialogPanel>
    </div>
  </Dialog>
);

export default MarkerDetailModal;
