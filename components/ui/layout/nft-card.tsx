import Image from 'next/image';
import { Card, Button } from '@nextui-org/react';

interface NFT {
  name: string;
  image: string;
  // ... other properties
}

const NFTCard: React.FC<{ nft: NFT; onClick: (nft: NFT) => void }> = ({ nft, onClick }) => {
  return (
    <Card
      className="w-full max-w-sm hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={() => onClick(nft)}
      aria-label={`NFT Card for ${nft.name}`}
    >
      <Image
        src={nft.image}
        alt={nft.name}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="rounded-md object-cover"
      />
      <Card.Body>
        <Card.Title>{nft.name}</Card.Title>
        {/* ... other card content ... */}
      </Card.Body>
      <Card.Footer>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick(nft);
          }}
          aria-label={`View details for ${nft.name}`}
        >
          View Details
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default NFTCard;