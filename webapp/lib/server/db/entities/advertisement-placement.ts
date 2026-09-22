import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Advertisement } from "./advertisement";
import { AD_PLACEMENTS, type AdPlacement } from "./enums";

@Entity("advertisement_placements")
export class AdvertisementPlacement {
  @PrimaryColumn({ name: "advertisement_id", type: "bigint" })
  advertisementId!: string;

  @PrimaryColumn({
    type: "enum",
    enum: [...AD_PLACEMENTS],
    enumName: "ad_placement",
  })
  placement!: AdPlacement;

  @Column({ name: "created_at", type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @ManyToOne(() => Advertisement, (advertisement) => advertisement.placements, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "advertisement_id" })
  advertisement?: Advertisement;
}