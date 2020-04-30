package com.longpeng.jail.bean.entity;

import com.cq1080.jpa.entity.BaseEntity;
import com.cq1080.meta.annotation.Meta;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EntityListeners;

@EqualsAndHashCode(callSuper = true)
@Entity
@Data
@EntityListeners(AuditingEntityListener.class)
@ApiModel(value = "DetentionCenter",description = "看守所")
@Meta()
public class DetentionCenter extends BaseEntity {

    @ApiModelProperty(value = "派出所名称")
    @Meta(displayInList = true,searchable = true)
    private String name;

    @ApiModelProperty(value = "备注")
    @Meta(searchable = true)
    private String note;

    @ApiModelProperty(value = "状态")
    @Meta(displayInList = true,searchable = true)
    @Column(insertable = false,columnDefinition = "int default 1")
    private Integer freeze;


}
